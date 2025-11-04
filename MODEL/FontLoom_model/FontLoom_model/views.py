from django.http import JsonResponse
from django.conf import settings
from .model_functions import get_gallery_data,get_personalized_suggestions,get_recommendations
import pandas as pd
import os,random

originalFonts = os.path.join(settings.BASE_DIR, "FontLoom_model", "ml_model", "google_fonts.csv")
df_original = pd.read_csv(originalFonts)
df_original['family'] = df_original['family'].str.strip().str.lower() 
category_map = pd.Series(df_original.category.values, index=df_original.family).to_dict()


def pick_unique_category_fonts(recommendations, category_map, limit=3):
    """
    Picks fonts ensuring all selected fonts belong to unique categories.
    Returns up to `limit` fonts.
    """
    chosen = []
    used_categories = set()

    for font_name in recommendations:
        category = category_map.get(font_name.strip().lower(), "none")

        # Skip if category already used
        if category in used_categories:
            continue
        chosen.append({"name": font_name, "category": category})
        used_categories.add(category)

        if len(chosen) >= limit:
            break

    return chosen




def gallery_api(request):
    gallery_data = get_gallery_data()
    if not gallery_data:
        return JsonResponse({"error":"Something went wrong with Model"},status=500)
    
    try:
        category_map
    except FileNotFoundError:
        return JsonResponse({"error": "googleFonts.csv not found."}, status=500)

    for cluster in gallery_data:
        enriched_fonts = []
        for font_name in cluster['fonts']:
            category = category_map.get(font_name.strip().lower(), 'sans-serif')
            enriched_fonts.append({
                "name": font_name,
                "category": category
            })
        cluster['fonts'] = enriched_fonts

    return JsonResponse({"gallery_data":gallery_data})


def personalized_api(request):
    liked_fonts = request.GET.get("font_names")
    if not liked_fonts:
        return JsonResponse({"error":"font names are required"},status=400)
    
    liked_fonts = [font.strip() for font in liked_fonts.split(",")]
    suggestions = get_personalized_suggestions(liked_fonts)

    try:
        category_map
    except FileNotFoundError:
        return JsonResponse({"error": "googleFonts.csv not found."}, status=500)


    enriched_suggestions = []
    for font_name in suggestions:
        category = category_map.get(font_name.strip().lower(), "sans-serif")
        enriched_suggestions.append({
            "name": font_name,
            "category": category
        })

    return JsonResponse({'based_on': liked_fonts, 'suggestions': enriched_suggestions})


def recommendation_api(request):
    font_names_param = request.GET.get("font_names")

    if not font_names_param:
        return JsonResponse({"error": "font name is required."}, status=400)

    locked_fonts = [name.strip() for name in font_names_param.split(",") if name.strip()]
    if len(locked_fonts) > 3:
        return JsonResponse({"error": "Maximum of 3 locked fonts allowed."}, status=400)


    # Call ML recommendation function
    recommendations = get_recommendations(locked_fonts)
    if not recommendations:
        return JsonResponse({"error": "No valid fonts found or recommendation failed."}, status=400)
    random.shuffle(recommendations)

    try:
        category_map
    except FileNotFoundError:
        return JsonResponse({"error": "google_fonts.csv not found."}, status=500)

    enriched_recommendations = []
    max_attempts = 5
    attempts = 0

    while len(enriched_recommendations) < 3 and attempts < max_attempts:
        enriched_recommendations = pick_unique_category_fonts(recommendations, category_map)
        if len(enriched_recommendations) < 3:
            random.shuffle(recommendations)
        attempts += 1

    # Fallback — if still not unique 3, just take top 3
    if len(enriched_recommendations) < 3:
        enriched_recommendations = [
            {"name": font_name, "category": category_map.get(font_name.strip().lower(), "none")}
            for font_name in recommendations[:3]
        ]

    random.shuffle(enriched_recommendations)
    locked_fonts_data = []
    for locked_font in locked_fonts:
        category = category_map.get(locked_font.strip().lower(), "sans-serif")
        locked_fonts_data.append({
            "name": locked_font,
            "category": category
        })

    return JsonResponse({
        "locked_fonts": locked_fonts_data,
        "recommendations": enriched_recommendations
    })
