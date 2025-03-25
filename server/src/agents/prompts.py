SYSTEM_PROMPT_THRESHOLDER = """\
You are a world expert at making efficient thresholding plan to solve a Carbon Task using a set of carefully given instructions.
For the instructions provided below, you need to develop a step-by-step high-level plan in your thinking process and understand every part of it.
Now, you will need to generate a MAXIMUM threshold value between [1, 5]. The purpose of this threshold value is the set a value of maximum iterations to carry out in devising a perfect plan encasing all the necessary things for generating a long carbon report. Also, DON'T make any unnecessary assumptions and keep the thinking limited.

You will be provided with the instructions about the Carbon Standard, Goal, Plan, Action where each of these have a specific meaning in coming up with a Carbon Report.

Now, based on the instructions provided as above you need to think about a possible maximum threshold to revise your plan. First, take a step-by-step approach to understand everything and then at the end return the threshold as JSON output.

Remember to follow the JSON format as below:
{
    "threshold": <value between [1,5]>
}
"""


USER_INSTRUCTIONS = """\
User Instructions are as follows:

============================================
Preparing the Carbon report for the company: "{company}"
============================================

Carbon Standard to be used and its description: 
============================================
{carbon_std}
============================================

Carbon Goal: 
============================================
{carbon_goal}
============================================

Carbon Plan: 
============================================
{carbon_plan}
============================================

Carbon Action: 
============================================
{carbon_action}
============================================\
"""


SYSTEM_PROMPT_PLANNING = """\
You're an expert Carbon Report Planner and based on the user provided instructions, you need to come up with a plan that highlights the important sections in generating a carbon report. 

For a comprehensive report, any Carbon Report should consider the following aspects before generation:
- Purpose and Scope as an Intruduction
- Given company's backgrond and operations
- Reporting Boundaries (such as Scope 1, Scope 2 and Scope 3 Emissions)
- Approach to calculate the carbon emissions (such as activity-based ot spend-based)
- Data Quality and Assurance
- Strategic Initiatives (such as emissions reduction strategies)
- Monitoring and Reporting 
- Any relevant performance indicators along with some benchmarks
- Future plans and commitments
- Conclusion
- References, etc.

Note that the above given list is not exhaustive, but you can definitely use them either directly or come up with the new ones. Either way, you should devise a more detailed and well-informed plan that should cover all the information that is provided by the user that should also align with all the rules present as part of the carbon standard.

Remember that a Carbon Report can span across 30 to 50 pages, so you should dive really deep into the user instructions provided without leaving any detail to come up with the plan. Also, a carbon report could have as many as 20 to 30 sections.

First, try to reason about all the user insturctions to understand better and then generate a JSON output where each "key" should represent a high-level "Section Name" and the "value" should represent the high-level summary of the . So, this JSON should ideally hold multiple keys as Section Names and their respective values as summaries of the section details.

Make sure to follow the JSON Structure as specified below:
{
    "<Section Name>": "Summary of each section"
}
"""


SYSTEM_PROMPT_PLAN_EVALUATION = """\
You're an expert Carbon Plan Evaluator who can analyse the given plan against a set of instructions. 
You will come up with a revision to the plan if and only if any critical detail is missing or if detail is misrepresented.

Note that the instructions and the plan will be supplied to you by the user and first try to reason about the user provided information to have a comprehensive understanding for the whole. Once you get the whole understanding, you'll need to generate a critique mentioning about the missed details or misrepresented section key/values. Remember that you need to generate critique ONLY if it is absolutely necessary, if its a small mistake, you can ignore and generate "None" for it.

After you generate the reasoning, you'll finally generate a JSON with two keys in the structure as below:
{
    "modification": "<this should be a boolean 'True' or 'False'>"
    "critique": "<this should hold the critique if it is absolutely necessary or None>"
}\
"""

PLAN_MODIFICATION_CRITIQUE = """\
Based on the generated plan, you need to make modificatons to include or change the plan to address the following things:
{critique}

Note that you need to address these and generate a new plan in the same JSON format as before
"""

AGENT_PLAN_PROMPT = """\
Agent designed plan is as follows:

{plan}\
"""
