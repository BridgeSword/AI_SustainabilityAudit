import os
from glob import glob

import pymupdf

from sentence_transformers import SentenceTransformer

from nltk import sent_tokenize

from ...main import celery_app, milvus_client
from ...core.utils import get_logger, clear_torch_cache
from ...core.config import settings, GAIEmbeddersCollections, settings


logger = get_logger(__name__)


def compute_chunks(inputs, text_sents, chunk_size_approx=256, overlap_tokens=20):
    start_idx = 0

    out_embs = []
    out_texts = []

    added_idxs = set()

    while start_idx < len(inputs["input_ids"]):
        curr_len = len(inputs["input_ids"][start_idx])
        temp_embs = [inputs["input_ids"][start_idx]]
        temp_txts = [text_sents[start_idx]]

        temp_idxs = [start_idx]

        while start_idx+1<len(inputs["input_ids"]) and curr_len <= chunk_size_approx:
            start_idx += 1
            
            temp_embs.append(inputs["input_ids"][start_idx])
            temp_txts.append(text_sents[start_idx])

            temp_idxs.append(start_idx)
            
            curr_len += len(inputs["input_ids"][start_idx])
        
        if tuple(temp_idxs) not in added_idxs:
            out_embs.append(temp_embs)
            out_texts.append(temp_txts)
        
            added_idxs.add(tuple(temp_idxs))
        else:
            start_idx += 1
            continue
        

        if start_idx+1 >= len(inputs["input_ids"]):
            break

        if len(inputs["input_ids"][start_idx]) >= chunk_size_approx:
            start_idx += 1
            continue

        curr_overlap_size = 0

        while start_idx > 0 and curr_overlap_size <= overlap_tokens:
            start_idx -= 1
            curr_overlap_size += len(inputs["input_ids"][start_idx])

    
    return out_texts


@celery_app.task(ignore_result=False, track_started=True)
def start_computing(docs_path: str, embedding_model: str, device:str = None):

    logger.info("Computing Document Embeddings")

    embedding_model = embedding_model.lower().strip()

    docs_path = docs_path+"/*.pdf" if docs_path[-1] != "/" else docs_path+"*.pdf"

    logger.info(f"Docs path: {docs_path} and genai model: {embedding_model}")

    if embedding_model in GAIEmbeddersCollections.opensource_embedders().keys() and os.getenv("USE_EMBEDDERS_LOCALLY"):
        logger.info("\n\nDownloading and/or loading all required Embedding Models locally!\n\n")

        # for _, emb_model in settings.embedders.model_fields.items():
        emb_model = settings.embedders.model_fields[embedding_model].default
        
        logger.info(f"Dowloading/Loading and computing chunks for: {emb_model}")
        embedder = SentenceTransformer(emb_model,
                                       trust_remote_code=True, 
                                       device=device)
        
        emb_tokenizer = embedder.tokenizer

        for doc_path in glob(docs_path):
            doc = pymupdf.open(doc_path)

            text_list = []

            for page in doc:
                text = page.get_text()
                text_list.append(text)

            sent_tokenized_text = sent_tokenize(" ".join(text_list))

            emb_inps = emb_tokenizer(sent_tokenized_text, **settings.embedders.default_emb_params)

            emb_chunks = compute_chunks(emb_inps, sent_tokenized_text, 
                                        chunk_size_approx=256, overlap_tokens=20)

            logger.info(f"Chunking completed for: {emb_model}")

            logger.info(f"Pushing embeddings to Milvus Vector Store with emb_model_name as {emb_model}!")

            emb_chunks_joined = [" ".join(i) for i in emb_chunks]
            
            computed_embeddings = embedder.encode(emb_chunks_joined, 
                                                  show_progress_bar="tqdm", 
                                                  device=device)
            
            vector_col_name = GAIEmbeddersCollections.mapping()[embedding_model]

            for chunk_idx, chunk in enumerate(computed_embeddings):
                chunk_data = {
                    "vector_embs": chunk,
                    "head_embs": chunk[:128],
                    "text_chunk": emb_chunks_joined[chunk_idx],
                    "emb_model_name": emb_model
                }

                milvus_client.insert(collection_name=vector_col_name, 
                                        data=chunk_data)

        del embedder
        clear_torch_cache()
    
    return True
    