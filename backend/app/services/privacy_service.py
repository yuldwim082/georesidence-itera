from typing import Tuple

def calculate_public_coordinates(
    latitude: float,
    longitude: float,
    seed_identifier: str = ""
) -> Tuple[float, float]:
    """
    Returns exact coordinates directly without spatial generalization,
    ensuring accurate map display and grouping for students in the same residence.
    """
    return round(latitude, 6), round(longitude, 6)
