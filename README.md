# poke-data

Run by cd'ing to this directory and running<br>
`python3 -m http.server 8080`<br>
Then going to localhost:8080 and selecting pokedata.html<br>


## TODO
- Fixed error for selecting multiple types on table<br>
- Add margin to table names<br>
- Change stats colors to encode stats and not types<br>
- Make stats breakdown distribution match the filtered pokemon<br>

## Midpoint Feedback
- Format radar chart decimals (could add max values but not necessary)<br>
- Normalized HP: Show real value on tooltip
- Eevee evolution chart bug (filters?)
- Show selected pokemon on table and scatterplot (use selection.raise https://github.com/d3/d3-selection/blob/v2.0.0/README.md#selection_raise to bring to front)
- Highlight of table row could highlight in scatterplot (or reduce opacity/gray out other options)
