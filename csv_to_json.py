import pandas as pd
import numpy as np
import json


def str_to_array(str):
    str_array = json.loads(str.replace("'", '"'))
    return [int(x) for x in str_array]


evol_df = pd.read_csv("data/evolutions.csv")
evol_df['long_id'] = evol_df.long_id.astype(np.int64)
evol_df['ev_from'] = evol_df.ev_from.fillna(0)
evol_df['ev_from'] = evol_df.ev_from.astype(np.int64)
evol_df['ev_to'] = evol_df.ev_to.map(str_to_array)
evol_df['evo_family'] =evol_df.evo_family.map(str_to_array)
result = evol_df.to_json(orient="index")
parsed = json.loads(result)
parsed_list = [v for v in parsed.values()]

with open("data/evolutions.json", 'w') as out:
    json.dump(parsed_list, out)

poke_df = pd.read_csv("data/pokemon.csv")
result = poke_df.to_json(orient="index")
parsed = json.loads(result)
parsed_list = [v for v in parsed.values()]

with open("data/pokemon.json", 'w') as out:
    json.dump(parsed_list, out)
