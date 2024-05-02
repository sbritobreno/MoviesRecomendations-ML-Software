#!/usr/bin/env python
# coding: utf-8

# In[1]:


import pandas as pd
import sys
import json
import os

# Get command-line arguments
user_data_json = sys.argv[1]
upcoming_movies_flag = sys.argv[2]
# Parse user data JSON string
user = json.loads(user_data_json)
upcomingMovies = upcoming_movies_flag.lower() == 'true'

# Adjust the directory to point to the 'data' folder
current_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(current_dir, '..', 'data')
csv_file_path = os.path.join(data_dir, 'movies.csv')

# Read the CSV file into a DataFrame
movies_df = pd.read_csv(csv_file_path)

# Define mood-genre associations
mood_genre_associations = {
    "Happy": ["Comedy", "Romance", "Animation"],
    "Sad": ["Drama", "Romance", "Biography"],
    "Angry": ["Action", "Crime", "Thriller"],
    "Excited": ["Adventure", "Action", "Fantasy"],
    "Anxious": ["Thriller", "Horror", "Mystery"],
    "Relaxed": ["Comedy", "Drama", "Documentary"],
    "Grateful": ["Musical", "Biography", "Romance"]
}

# Recomendation weights
weights = {
    "Mood": 0.3,
    "MovieGenre": 0.3,
    "Rate": 0.3,
    "Year": 0.1
}

# One-hot encode the 'Genre' column
movies_df_encoded = pd.get_dummies(movies_df, columns=['Genre'])

# Recommendation Generation
def recommend_movies_for_user(user_data, upcoming_movies):
    composite_scores = []

    # Filter movies released or not depending on upcoming_movies variable
    if upcoming_movies:
        movies_df_encoded_filtered = movies_df_encoded[(movies_df_encoded["Year"] == 2014) 
        & (~movies_df_encoded["Id"].isin(user_data["MoviesWatched"]))].copy()
    else:
        movies_df_encoded_filtered = movies_df_encoded[(movies_df_encoded["Year"] < 2014) 
        & (~movies_df_encoded["Id"].isin(user_data["MoviesWatched"]))].copy()

    movies_watched_ids = user_data["MoviesWatched"]
    movies_watched = movies_df_encoded[movies_df_encoded['Id'].isin(movies_watched_ids)]
    
    max_year = movies_df['Year'].max()
    min_year = movies_df['Year'].min()

    watched_year = movies_watched["Year"].mean()
    watched_score = movies_watched["AudienceScore"].mean()
    
    # Calculate genre percentages based on user's watched movies
    genre_percentages = {}
    total_movies_watched = len(user_data["MoviesWatched"])

    for movie_id in movies_watched_ids:
        movie_genres = movies_df_encoded[movies_df_encoded['Id'] == movie_id].filter(regex='Genre_*')
        for genre in movie_genres.columns:
            if genre in genre_percentages:
                genre_percentages[genre] += movie_genres[genre].values[0]
            else:
                genre_percentages[genre] = movie_genres[genre].values[0]

    for genre, count in genre_percentages.items():
        genre_percentages[genre] = count / total_movies_watched

    # Calculate composite scores for each movies
    for index, movie_data in movies_df_encoded_filtered.iterrows():
        composite_score = 0

        # Check which genres have a value of 1 for the current movie and add the correct value for the composite score
        genres_watched = [genre.split('_')[1] for genre, value in movie_data.items() if value == 1 and genre.startswith('Genre_')]
        genre = genres_watched[0]
        composite_score += genre_percentages[f'Genre_{genre}'] * weights["MovieGenre"]
        
        # Relevant genres based on user's mood
        user_mood = user_data["Mood"]
        relevant_genres = mood_genre_associations.get(user_mood, [])
        
        # Add composite score if the movie's genre is in the relevant genres
        if genre in relevant_genres:
            composite_score += weights["Mood"]

        # Add movie rate to composite score
        composite_score += movie_data["AudienceScore"] / 100 * weights["Rate"]

        # Calculate the contribution of the average year and add to composite score
        composite_score += (1 - abs(movie_data["Year"] - watched_year) / (max_year - min_year)) * weights["Year"]

        composite_scores.append(composite_score)

    # Add composite scores as a new column to the DataFrame
    movies_df_encoded_filtered['CompositeScore'] = composite_scores

    # Sort movies based on composite scores
    recommended_movies = movies_df_encoded_filtered.sort_values(by='CompositeScore', ascending=False)

    # Select top 10
    top_n_recommendations = recommended_movies.head(10)

    return top_n_recommendations

# Generate movie recommendations for the user
recommended_movies = recommend_movies_for_user(user, upcomingMovies)

# Iterate through each movie in the recommended movies DataFrame
for index, row in recommended_movies.iterrows():
    # Filter out the 'Genre' columns that start with "Genre_" and have a value of 1
    genre_columns = [col.split('_')[1] for col in recommended_movies.columns if col.startswith('Genre_') and row[col] == 1]
    
    # Format the output with fixed width for each column
    print(f"{row['Movie']:40} {genre_columns[0]:15} {row['Year']:10} {row['AudienceScore']:5} {row['CompositeScore']:20} {row['Id']:5}")



# %%
