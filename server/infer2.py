from transformers import BertTokenizer, BertForTokenClassification
from transformers import pipeline
from transformers import AutoTokenizer
import postprocess

model_name = "dbmdz/bert-large-cased-finetuned-conll03-english"
tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=True)
model = BertForTokenClassification.from_pretrained(model_name)

ner_pipeline = pipeline("ner", model=model, tokenizer=tokenizer, aggregation_strategy="max")


async def redact(req):
    ner_results = ner_pipeline(req.text)
    redacted_sentence = await postprocess.ner_postprocessing(ner_results, {"config" : "v1"}, req)
    # redacted_sentence = sentence
    # for entity in ner_results:
    #     entity_text = entity['word']
    #     entity_label = entity['entity_group']
    #     redacted_sentence = redacted_sentence.replace(entity_text, f"[{entity_label}]")
    return redacted_sentence
    
