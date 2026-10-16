import math

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees) in meters.
    """
    R = 6371000.0  # Earth's radius in meters
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    
    return round(R * c, 1)

def is_within_radius(lat1: float, lon1: float, lat2: float, lon2: float, radius_meters: float) -> tuple[bool, float]:
    """Check if point 2 is within radius_meters of point 1. Returns (in_radius, distance)."""
    dist = haversine_distance_meters(lat1, lon1, lat2, lon2)
    return dist <= radius_meters, dist
