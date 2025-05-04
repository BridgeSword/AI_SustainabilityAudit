import os
import json
import logging
import hashlib

import torch

from markdown_pdf import MarkdownPdf, Section

from ..core.config import settings


def get_logger(scope):
    logger = logging.getLogger(scope)

    if os.environ["APP_ENV"] in ["local", "dev", "stage"]:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.DEBUG)

    return logger

logger = get_logger(__name__)


def make_directories(dir_list):
    for _dir_ in dir_list:
        if os.path.exists(_dir_):
            continue
        os.makedirs(_dir_)

 
def delete_file(filepath):
    if os.path.exists(filepath):
        os.remove(filepath)


def get_hash(file_path):
    BUF_SIZE = 256*1024 # 256 KB

    with open(file_path, "rb") as fptr:
        file_hash = hashlib.md5()

        while chunk := fptr.read(BUF_SIZE):
            file_hash.update(chunk)

    return file_hash.hexdigest()


def get_device(req_device: str = None):
    if req_device is not None and req_device.lower().strip() == "cuda" and torch.cuda.is_available():
        return "cuda"
    elif req_device is not None and req_device.lower().strip() == "mps" and torch.mps.is_available():
        return "mps"
    else:
        logger.info("No CUDA or MPS found! Using CPU instead!")
        return "cpu"


def clear_torch_cache():
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    if torch.mps.is_available():
        torch.mps.empty_cache()


def RawJSONDecoder(index):
    class _RawJSONDecoder(json.JSONDecoder):
        end = None

        def decode(self, s, *_):
            data, self.__class__.end = self.raw_decode(s, index)
            return data
    return _RawJSONDecoder


def extract_json(s, index=0):
    while (index := s.find('{', index)) != -1:
        try:
            yield json.loads(s, cls=(decoder := RawJSONDecoder(index)))
            index = decoder.end
        except json.JSONDecodeError:
            index += 1


def thresolder(curr_val, max_val):
    return min(curr_val, max_val)

def create_multipage_pdf(text, filename="output.pdf"):
    pdf = MarkdownPdf()

    pdf.add_section(Section(text.strip(), toc=False))
    pdf.save(os.path.join(settings.carbon_reports_path, filename))
