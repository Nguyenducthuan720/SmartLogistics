import math
import random
import json
import numpy as np


def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def calculate_total_distance(order, driver_location):
    total = 0
    current = driver_location

    for point in order:
        total += haversine(current["lat"], current["lng"], point["lat"], point["lng"])
        current = point

    return total


def genetic_algorithm(delivery_points, driver_location, population_size=50, generations=100, mutation_rate=0.1):
    n = len(delivery_points)

    population = [random.sample(delivery_points, n) for _ in range(population_size)]

    for gen in range(generations):
        fitness = [(individual, calculate_total_distance(individual, driver_location)) for individual in population]
        fitness.sort(key=lambda x: x[1])

        elite = [ind for ind, _ in fitness[:3]]

        new_pop = elite[:]
        while len(new_pop) < population_size:
            parent1 = tournament_select(fitness)
            parent2 = tournament_select(fitness)
            child = ordered_crossover(parent1, parent2)
            if random.random() < mutation_rate:
                child = swap_mutation(child)
            new_pop.append(child)

        population = new_pop

    final_fitness = [(individual, calculate_total_distance(individual, driver_location)) for individual in population]
    final_fitness.sort(key=lambda x: x[1])

    best_order = final_fitness[0][0]
    best_distance = final_fitness[0][1]

    return best_order, best_distance


def tournament_select(fitness, k=5):
    candidates = random.sample(fitness, k)
    candidates.sort(key=lambda x: x[1])
    return candidates[0][0]


def ordered_crossover(parent1, parent2):
    n = len(parent1)
    a, b = sorted(random.sample(range(n), 2))

    child = [None] * n
    child[a:b] = parent1[a:b]

    p2_idx = 0
    for i in range(n):
        if child[i] is None:
            while parent2[p2_idx] in child:
                p2_idx += 1
            child[i] = parent2[p2_idx]
            p2_idx += 1

    return child


def swap_mutation(individual):
    a, b = random.sample(range(len(individual)), 2)
    individual[a], individual[b] = individual[b], individual[a]
    return individual


def optimize_route(warehouse, driver_location, delivery_points):
    if len(delivery_points) <= 1:
        total_distance = haversine(
            driver_location["lat"], driver_location["lng"],
            delivery_points[0]["lat"], delivery_points[0]["lng"]
        ) if delivery_points else 0
        return {
            "optimal_order": delivery_points,
            "total_distance_km": round(total_distance, 2),
            "estimated_time_hours": round(total_distance / 50, 2),
            "algorithm": "direct"
        }

    best_order, best_distance = genetic_algorithm(delivery_points, driver_location)

    return {
        "optimal_order": [
            {"lat": p["lat"], "lng": p["lng"], "address": p.get("address", "")}
            for p in best_order
        ],
        "total_distance_km": round(best_distance, 2),
        "estimated_time_hours": round(best_distance / 50, 2),
        "algorithm": "genetic_algorithm",
        "warehouse": warehouse,
        "driver_start": driver_location
    }


if __name__ == "__main__":
    points = [
        {"lat": 10.8300, "lng": 106.6900, "address": "Point A"},
        {"lat": 10.8450, "lng": 106.7100, "address": "Point B"},
        {"lat": 10.8100, "lng": 106.6500, "address": "Point C"},
        {"lat": 10.8500, "lng": 106.6700, "address": "Point D"},
        {"lat": 10.8200, "lng": 106.7200, "address": "Point E"},
        {"lat": 10.8350, "lng": 106.6600, "address": "Point F"},
    ]
    result = optimize_route(
        {"lat": 10.8231, "lng": 106.6297},
        {"lat": 10.8231, "lng": 106.6297},
        points
    )
    print("Route:", json.dumps(result, indent=2))
