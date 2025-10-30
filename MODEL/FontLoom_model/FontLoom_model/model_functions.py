import numpy as np
import pandas as pd
from django.conf import settings
import joblib
import os

# ---- 1. Load Model and Data ONCE at startup ----
MODEL_PATH = os.path.join(settings.BASE_DIR,"FontLoom_model","ml_model","font_knn.joblib")
DATA_PATH = os.path.join(settings.BASE_DIR,"FontLoom_model", 'ml_model', 'font_data_with_clusters.csv')

try:
    knn_model = joblib.load(MODEL_PATH)
except FileNotFoundError:
    raise Exception(f"Model file not found at {MODEL_PATH}")


try:
    df3 = pd.read_csv(DATA_PATH)
except FileNotFoundError:
    raise Exception(f"Data file not found at {DATA_PATH}")

df_features = df3.drop(columns=['family', 'cluster'])


# Function for personalized Page
def get_personalized_suggestions(liked_fonts, n_recommendations=20):
    """
    Generates personalized font suggestions based on a user's liked fonts using the pre-loaded KNN model.

    Args:
        liked_fonts (list): A list of font names the user has liked.
        n_recommendations (int): The number of suggestions to return.

    Returns:
        A list of recommended font names. Returns an empty list if no valid liked fonts are found.
    """
    # Step 1: Get the feature vectors for all of the user's liked fonts
    liked_vectors = []
    for font_name in liked_fonts:
        if font_name in df3['family'].values:
            font_index = df3[df3['family'] == font_name].index[0]
            liked_vectors.append(df_features.loc[font_index].values)
        else:
            print(f"Warning: Font '{font_name}' not in dataset. Skipping.")

    if not liked_vectors:
        print("Error: No valid liked fonts were found.")
        return []

    # Step 2: Calculate the user's average "taste" vector
    average_vector = np.mean(liked_vectors, axis=0).reshape(1, -1)

    # Step 3: Use the pre-built KNN model to find the neighbors of this average vector
    # We fetch extra neighbors to ensure we can filter out the ones already liked
    num_neighbors_to_fetch = n_recommendations + len(liked_fonts)
    distances, indices = knn_model.kneighbors(average_vector, n_neighbors=num_neighbors_to_fetch)

    # Step 4: Extract names and filter out fonts the user already likes
    recommended_fonts = []
    for i in indices[0]:
        font_name = df3.iloc[i]['family']
        # Add the font if it's not one of the inputs and not already in our list
        if font_name not in liked_fonts and font_name not in recommended_fonts:
            recommended_fonts.append(font_name)
    
    # Return the top N recommendations
    return recommended_fonts

# Function for Gallery Page
def get_gallery_data():
    """
    Groups fonts by cluster and sorts clusters by the number of fonts they contain.
    
    Returns:
        A list of dictionaries, where each dictionary represents a cluster.
        Example:
        [
            {'cluster_id': 5, 'font_count': 400, 'fonts': ['Roboto', 'Open Sans', ...]},
            {'cluster_id': 6, 'font_count': 200, 'fonts': ['Lato', 'Merriweather', ...]},
            ...
        ]
    """
    if df3 is None:
        return []

    # 1. Count fonts in each cluster and get the sorted order
    cluster_counts = df3['cluster'].value_counts()
    sorted_cluster_ids = cluster_counts.index.tolist()

    # 2. Prepare the data structure for the template
    gallery_clusters = []
    for cluster_id in sorted_cluster_ids:
        # Get all fonts belonging to the current cluster
        
        # Rename 'family' to 'name' to match the desired API output
        fonts_in_cluster = df3[df3['cluster'] == cluster_id]['family'].tolist()
        
        gallery_clusters.append({
            'cluster_id': cluster_id,
            'font_count': len(fonts_in_cluster),
            'fonts': fonts_in_cluster
        })
        
    return gallery_clusters

"""
# Recommendation Function 
def get_recommendations(locked_font_name):
    # Find the index of the locked font
    if locked_font_name not in df3['family'].values:
        return None # Return None if font not found

    locked_font_index = df3[df3['family'] == locked_font_name].index[0]

    # Get the cluster label for the locked font
    locked_font_cluster = df3.loc[locked_font_index, 'cluster']

    # Filter fonts in the same cluster
    cluster_fonts_df = df3[df3['cluster'] == locked_font_cluster].copy()
    cluster_font_names = cluster_fonts_df[cluster_fonts_df['family'] != locked_font_name]['family'].tolist()

    # Get features for the locked font
    locked_font_features = df_features.loc[locked_font_index].values.reshape(1, -1)

    # Use kNN to find nearest neighbors
    distances, indices = knn_model.kneighbors(locked_font_features)
    knn_indices = indices[0]
    knn_font_names = df3.iloc[knn_indices]['family'].tolist()
    knn_font_names = [font for font in knn_font_names if font != locked_font_name]

    # Combine and weigh recommendations
    recommendations = {}
    for font in cluster_font_names:
        recommendations[font] = recommendations.get(font, 0) + 2

    for font in knn_font_names:
        recommendations[font] = recommendations.get(font, 0) + 1

    for font in set(cluster_font_names) & set(knn_font_names):
        recommendations[font] += 2

    sorted_recommendations = sorted(recommendations.items(), key=lambda item: item[1], reverse=True)

    return sorted_recommendations
"""
def get_recommendations(locked_font_names):
    # Ensure input is a list (even if a single font is passed)
    if isinstance(locked_font_names, str):
        locked_font_names = [locked_font_names]

    # Filter out fonts not present in dataset
    valid_fonts = [f for f in locked_font_names if f in df3['family'].values]
    if not valid_fonts:
        return None  # Return None if no valid font found

    recommendations = {}

    for locked_font_name in valid_fonts:
        locked_font_index = df3[df3['family'] == locked_font_name].index[0]
        locked_font_cluster = df3.loc[locked_font_index, 'cluster']

        # Cluster-based recommendations
        cluster_fonts_df = df3[df3['cluster'] == locked_font_cluster].copy()
        cluster_font_names = cluster_fonts_df[cluster_fonts_df['family'] != locked_font_name]['family'].tolist()

        # kNN-based recommendations
        locked_font_features = df_features.loc[locked_font_index].values.reshape(1, -1)
        distances, indices = knn_model.kneighbors(locked_font_features)
        knn_indices = indices[0]
        knn_font_names = df3.iloc[knn_indices]['family'].tolist()
        knn_font_names = [font for font in knn_font_names if font != locked_font_name]

        # Combine and weigh
        for font in cluster_font_names:
            recommendations[font] = recommendations.get(font, 0) + 2

        for font in knn_font_names:
            recommendations[font] = recommendations.get(font, 0) + 1

        for font in set(cluster_font_names) & set(knn_font_names):
            recommendations[font] += 2

    # Exclude locked fonts from final output
    for locked_font_name in valid_fonts:
        if locked_font_name in recommendations:
            del recommendations[locked_font_name]

    # Sort by weight (descending)
    sorted_recommendations = sorted(recommendations.items(), key=lambda item: item[1], reverse=True)

    # Return font names
    top_recommendations = [font for font, _ in sorted_recommendations]
    
    return top_recommendations
