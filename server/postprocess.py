import re
import getdata
# Simulated NER Post-Processing Function
async def ner_postprocessing(text, entities,r):
    print("Performing post-NER steps...")

    # 1. Entity Validation: Check if the recognized entities conform to expected types/formats
    print("\nStep 1: Validating entity formats...")
    # for entity in entities:
    #     if entity.get('type') == 'DATE':
    #         valid_date = bool(re.match(r'\d{4}-\d{2}-\d{2}', entity.get('text', '')))  # Example date format YYYY-MM-DD
            # print(f"Validating entity '{entity.get('text')}' as DATE: {valid_date}")

    # 2. Entity Normalization: Normalize entities to canonical forms
    print("\nStep 2: Normalizing entities...")
    # for entity in entities:
    #     if entity.get('type') == 'PERSON':
    #         normalized_name = entity.get('text', '').title()  # Normalize person names to title case
            # print(f"Normalized PERSON entity '{entity.get('text')}' to '{normalized_name}'")

    # 3. Entity Disambiguation: Resolve ambiguous entities (e.g., organization names like 'Apple')
    print("\nStep 3: Disambiguating entities...")
    # for entity in entities:
    #     if entity.get('type') == 'ORG' and entity.get('text') == 'Apple':
    #         print("Disambiguating entities")
            # print(f"Disambiguating '{entity.get('text')}' as an organization (Tech Company)")

    # 4. Detect Overlaps: Check for overlapping or conflicting entity spans
    print("\nStep 4: Detecting entity conflicts...")
    # seen_spans = set()
    # for entity in entities:
    #     entity_span = (entity.get('start'), entity.get('end'))
    #     if entity_span in seen_spans:
    #         print(f"Conflict detected: Overlapping entity present - resolving")
    #     seen_spans.add(entity_span)

    data = await getdata.redact(r)
    print(f"data is {data}")

    # 5. Categorize Entities: Group entities into types (e.g., people, places)
    print("\nStep 5: Categorizing entities...")
    # categories = {'temporal': [], 'geographic': [], 'person': [], 'organization': []}
    # for entity in entities:
    #     if entity.get('type') == 'DATE':
    #         categories['temporal'].append(entity.get('text'))
    #     elif entity.get('type') == 'GPE':  # Geo-Political Entity
    #         categories['geographic'].append(entity.get('text'))
    #     elif entity.get('type') == 'PERSON':
    #         categories['person'].append(entity.get('text'))
    #     elif entity.get('type') == 'ORG':
    #         categories['organization'].append(entity.get('text'))
    # print("Categorized entities:", categories)

    # 6. Anonymize Entities: Redact or anonymize sensitive data
    print("\nStep 6: Anonymizing sensitive entities...")
    # for entity in entities:
    #     if entity.get('type') == 'PERSON':
    #         anonymized_entity = '[REDACTED]'
    #         print(f"Anonymizing entity found")

    # 7. Confidence-Based Filtering: Filter out low-confidence entities

            # print(f"Filtering out entity '{entity.get('text')}' with low confidence: {confidence}")

    # 10. Text Segmentation: Segment the text around entity boundaries
    print("\nStep 7: Segmenting text around entity boundaries...")
    # segments = []
    # last_index = 0
    # for entity in entities:
    #     segments.append(text[last_index:entity.get('start')])
    #     segments.append(f"[{entity.get('type')}: {entity.get('text')}]")
    #     last_index = entity.get('end', last_index)
    # segments.append(text[last_index:])
    # segmented_text = ''.join(segments)
    # print("Segmented Text:", segmented_text)

    # Return the original text (no modifications applied)
    # print("\nReturning the original text without modifications.")
    return data


# ner_postprocessing(original_text, entities)