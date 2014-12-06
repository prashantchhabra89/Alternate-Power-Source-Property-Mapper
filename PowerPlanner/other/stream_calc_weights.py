#!/usr/bin/env python
import sys
import json
import math
import re
import os

def main():
	"""
	Using the JSON file of stream info, and formatted Hydro data points, this script
	combines them and bins them into several JSON files. This allows the server to
	only have to account for one set of Hydro data, instead of keeping streams and
	weights separate
	"""
	seasons = ['anu', 'djf', 'jja', 'mam', 'son']
	hydro_dat = []

	for season in seasons:
		with open("Hydro_" + season + ".json") as f:
			hydro_dat.append(json.loads(f.read()))

	dir_files = [x for x in os.listdir(os.getcwd()) if re.match(r'^Stream.*\.json$', x)]
	for dir_file in dir_files:
		with open(dir_file) as f:
			print "Getting weighted values for " + dir_file 
			this_stream = json.loads(f.read())
			for sub_stream in this_stream:
				#print sub_stream
				stream_points = sub_stream['points']
				stream_center_lat = avg_loc(stream_points[0]['lat'], stream_points[-1]['lat'])
				stream_center_lon = avg_loc(stream_points[0]['lon'], stream_points[-1]['lon'])

				nearest_stn = []
				nearest_distance = []

				# Get 2 nearest hydro stations
				for i in range(len(hydro_dat[0])):
					if (len(nearest_stn) < 3):
						nearest_stn.append(i)
						nearest_distance.append(distance_between(
							stream_center_lat,
							stream_center_lon,
							hydro_dat[0][i]['lat'],
							hydro_dat[0][i]['lon']))
					else:
						dist_to_stream = distance_between(
							stream_center_lat,
							stream_center_lon,
							hydro_dat[0][i]['lat'],
							hydro_dat[0][i]['lon'])
						furthest_near_stn = max(nearest_distance)
						if dist_to_stream < furthest_near_stn:
							for j in range(len(nearest_distance)):
								if nearest_distance[j] == furthest_near_stn:
									nearest_stn[j] = i
									nearest_distance[j] = dist_to_stream

				# If the furthest is too far away, disregard
				if max(nearest_distance) > 2 * min(nearest_distance):
					for j in range(len(nearest_distance)):
						if nearest_distance[j] == min(nearest_distance):
							del nearest_distance[j]
							del nearest_stn[j]
							break

				# Assign precalcs and speeds based on scaled values
				# Get seasonal values in too
				for season in seasons:
					distance_sum = math.pow(sum([x for x in nearest_distance]), 4)
					#print "Dist Sum:" + str(distance_sum),
					precalc = 0
					for j in range(len(nearest_distance)):
						#print " | Speed: " + str(hydro_dat[seasons.index(season)][nearest_stn[j]]['precalc']),
						precalc += (math.pow((1 - (nearest_distance[j] / distance_sum)), 4) * 
							hydro_dat[seasons.index(season)][nearest_stn[j]]['precalc'])
					#print " | Precalc: " + str(precalc),
					if 'weights' in sub_stream.keys():
						try:
							if precalc < 0:
								raise ValueError
							if len(nearest_distance) == 1:
								sub_stream['weights'].update({season : math.log(precalc/2, 4)})
								#print " | Weight: " + str(precalc/2),
							else:
								sub_stream['weights'].update({season : math.log(precalc/(len(nearest_distance)), 4)})
								#print " | Weight: " + str(precalc/(len(nearest_distance)-1)),
						except ValueError:
							print("ValueError encountered! Value dump:")
							print("distance sum: " + str(distance_sum))
							print("precalc: " + str(precalc))
							print("number nearby: " + str(len(nearest_distance)))
							sub_stream['weights'].update({season : 0})
					else:
						try:
							if precalc < 0:
								raise ValueError
							if len(nearest_distance) == 1:
								sub_stream['weights'] = ({season : math.log(precalc/2, 4)})
								#print " | Weight: " + str(precalc/2),
							else:
								sub_stream['weights'] = ({season : math.log(precalc/(len(nearest_distance)), 4)})
								#print " | Weight: " + str(precalc/(len(nearest_distance)-1)),
						except ValueError:
							print("ValueError encountered! Value dump:")
							print("distance sum: " + str(distance_sum))
							print("precalc: " + str(precalc))
							print("number nearby: " + str(len(nearest_distance)))
							sub_stream['weights'] = ({season : 0})
					#print

		# export to json
		with open("..\\weighted_streams\\" + dir_file, 'w') as g:
			g.write(json.dumps(this_stream, separators=(',',':')))

def avg_loc(loc1, loc2):
	return (loc1 + loc2)/2

def distance_between(y1, x1, y2, x2):
	a = math.pow((y1-y2), 2)
	b = math.pow((x1-x2), 2)

	return math.sqrt(a+b)

if __name__=="__main__":
	main()