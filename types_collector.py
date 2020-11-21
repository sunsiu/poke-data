import requests
import json

# API src https://pokeapi.co/docs/v2#types
types = ["water", "normal", "grass", "bug", "fire", "psychic", "rock", "electric", "ground", "dark", "poison", "fighting", "dragon", "ghost", "ice", "steel", "fairy", "flying"] 
result = []
for i, t in enumerate(types):
    res = requests.get("https://pokeapi.co/api/v2/type/{}".format(t))
    data = res.json()
    relations = data["damage_relations"]

    strong_against = []
    for x in [d['name'] for d in relations["double_damage_to"]]:
        strong_against.append(x)

    weak_against = []
    for x in [d['name'] for d in relations["half_damage_to"]]:
        weak_against.append(x)

    no_effect_against = []
    for x in [d['name'] for d in relations["no_damage_to"]]:
        no_effect_against.append(x)

    payload = {
        "type": t,
        "strong_against": strong_against,
        "weak_against": weak_against,
        "no_effect_against": no_effect_against
    }
    result.append(payload)

f = open('data/types.json', "w")
json.dump(result, f)
f.close()
