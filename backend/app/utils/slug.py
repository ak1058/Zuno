# app/utils/slug.py
import re
import unicodedata

def create_slug(text: str) -> str:
    """
    Convert text to URL-friendly slug
    """
    # Normalize unicode characters
    text = unicodedata.normalize('NFKD', text)
    
    # Convert to lowercase and remove special characters
    slug = re.sub(r'[^\w\s-]', '', text.lower())
    
    # Replace spaces and underscores with hyphens
    slug = re.sub(r'[-\s]+', '-', slug)
    
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    
    return slug