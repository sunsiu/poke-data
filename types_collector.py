import requests
import json
import numpy as np

# API src https://pokeapi.co/docs/v2#types
types = ["water", "normal", "grass", "bug", "fire", "psychic", "rock", "electric", "ground", "dark", "poison", "fighting", "dragon", "ghost", "ice", "steel", "fairy", "flying"] 
result = np.zeros((18, 18), dtype=int)
for i, t in enumerate(types):
    res = requests.get("https://pokeapi.co/api/v2/type/{}".format(t))
    data = res.json()
    relations = data["damage_relations"]
    row = result[i]
    for x in [d['name'] for d in relations["double_damage_from"]]:
        row[types.index(x)] = 1

    for x in [d['name'] for d in relations["double_damage_to"]]:
        row[types.index(x)] = 2

    for x in [d['name'] for d in relations["no_damage_to"]]:
        row[types.index(x)] = 3

f = open('data/types.json', "w")
json.dump(result.tolist(), f)
f.close()
