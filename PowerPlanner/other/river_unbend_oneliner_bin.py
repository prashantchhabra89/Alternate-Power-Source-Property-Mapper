#!/usr/bin/env python
import sys
import re
from itertools import izip
import math
import string

def main():
	"""
	This script loads in a grepped version of a huge XML file of river points.
	It takes out short rivers and removes points in rivers with bends of less
	than 30 degrees (to save on space). All this is saved to a JSON file
	""" 
	if len(sys.argv) > 1:
		fname = sys.argv[1]
		jname = string.split(fname, '.')[0] + ".json"
		
		bins = [[[] for i in range(361)] for j in range(181)]
		
		lat_offset = 90
		lng_offset = 180
		
		short_count = 0
		unbent_count = 0
		north_count = 0
		bent_count = 0
		line_count = 0
		cut_count = 0
		
		min_lat_bin = 181
		max_lat_bin = 0
		min_lng_bin = 361
		max_lng_bin = 0
		
		comma_flag = False
		
		with open(fname) as f:
			print("Processing " + fname + "...")
			for line in f:
				river_points = extract_points(line)
				if river_points:
					if get_distance(river_points[0], river_points[-1]) > 0.02:
						unbent_points = []

						unbent_points.append(river_points[0])
						last_points = river_points[0]
						idx = 1
						
						last_floor_lat = math.floor(river_points[0][0])
						last_floor_lng = math.floor(river_points[0][1])

						while idx < (len(river_points) - 1):
							this_floor_lat = math.floor(river_points[idx][0])
							this_floor_lng = math.floor(river_points[idx][1])
							
							if not this_floor_lat == last_floor_lat or not this_floor_lng == last_floor_lng:
								river_cut_point = get_point(river_points[idx])
								unbent_points.append(river_cut_point)
								
								bins[int(this_floor_lat) + lat_offset][int(this_floor_lng) + lng_offset].append(unbent_points)
								min_lat_bin = min(min_lat_bin, int(this_floor_lat) + lat_offset)
								max_lat_bin = max(max_lat_bin, int(this_floor_lat) + lat_offset)
								min_lng_bin = min(min_lng_bin, int(this_floor_lng) + lng_offset)
								max_lng_bin = max(max_lng_bin, int(this_floor_lng) + lng_offset)
								
								unbent_points = []
								unbent_points.append(river_cut_point)
								last_points = river_cut_point
								cut_count += 1
								
								last_floor_lat = this_floor_lat
								last_floor_lng = this_floor_lng

								idx += 1
							else:
								bend_angle = get_bend_angle(last_points, river_points[idx], river_points[idx+1])
								if bend_angle > 30:
									unbent_points.append(river_points[idx])
									last_points = river_points[idx]
								else:
									unbent_count += 1
								idx += 1
						unbent_points.append(river_points[len(river_points) - 1])
						bent_count += len(unbent_points)
						bins[int(math.floor(river_points[len(river_points) - 1][0])) + lat_offset][int(math.floor(river_points[len(river_points) - 1][1])) + lng_offset].append(unbent_points)
						min_lat_bin = min(min_lat_bin, int(math.floor(river_points[len(river_points) - 1][0])) + lat_offset)
						max_lat_bin = max(max_lat_bin, int(math.floor(river_points[len(river_points) - 1][0])) + lat_offset)
						min_lng_bin = min(min_lng_bin, int(math.floor(river_points[len(river_points) - 1][1])) + lng_offset)
						max_lng_bin = max(max_lng_bin, int(math.floor(river_points[len(river_points) - 1][1])) + lng_offset)
					else:
						short_count += 1
				line_count += 1
				if line_count % 10000 == 0:
					print("Processed count: " + str(line_count))

		print("FINISHED processing")
		print("Processed total streams: " + str(line_count))
		print("Removed streams (too northern): " + str(north_count))
		print("Removed streams (too short): " + str(short_count))
		print("Removed bends: " + str(unbent_count))
		print("Remaining streams: " + str(line_count - short_count))
		print("Remaining bends: " + str(bent_count))
		print("- " * 10)
		print("Minimum latitude bin: " + str(min_lat_bin - lat_offset))
		print("Maximum latitude bin: " + str(max_lat_bin - lat_offset))
		print("Minimum longitude bin: " + str(min_lng_bin - lng_offset))
		print("Maximum longitude bin: " + str(max_lng_bin - lng_offset))		

		for lat in range(len(bins)):
			for lng in range(len(bins[0])):
				if lat <= max_lat_bin and lat >= min_lat_bin and lng <= max_lng_bin and lng >= min_lng_bin:
					jname = "streams/Stream_" + str(lat - lat_offset + 1) + "_" + str(lng - lng_offset + 1) + \
								"_" + str(lat - lat_offset) + "_" + str(lng - lng_offset) + ".json"
					with open(jname, 'w') as json:
						comma_flag = False
						json.write('[')
						for stream in bins[lat][lng]:
							inner_comma_flag = False
							if comma_flag:
								json.write(',')
							json.write('{"points":[')
							for point in stream:
								if inner_comma_flag:
									json.write(',')
								json.write('{')
								json.write('"lat":' + str(point[0]) + ',')
								json.write('"lon":' + str(point[1]))
								json.write('}')
								inner_comma_flag = True
							json.write(']}')
							comma_flag = True
						json.write(']')

					print("Lat: " + str(lat - lat_offset) + " Lng: " + str(lng - lng_offset)),
					print("Count: " + str(len(bins[lat][lng])))

	else:
		print("Usage: python river_unbend.py [FILE]")

def extract_points(line):
	point_pattern = re.compile(r'[\d\.-]*')
	point_match = point_pattern.findall(line)
	point_match = [float(point) for point in point_match if not point in ('', '.', '-')]
	
	if len(point_match):
		point_iter = izip(*[iter(point_match)]*2)
		point_match = [point for point in point_iter]

	return point_match

def get_distance(vec1, vec2):
	x_diff = vec1[0] - vec2[0]
	y_diff = vec1[1] - vec2[1]

	return math.sqrt(math.pow(x_diff, 2) + math.pow(y_diff, 2))

def get_point(pnt):
	return [pnt[0], pnt[1]]
	
def get_bend_angle(vec1, vec2, vec3):
	u1 = vec1[0] - vec2[0]
	v1 = vec3[0] - vec2[0]
	u2 = vec1[1] - vec2[1]
	v2 = vec3[1] - vec2[1]

	numer = 0
	denom = 0
	degree = 0

	try:
		numer = (u1 * v1) + (u2 * v2)
		denom = math.sqrt(math.pow(u1, 2) + math.pow(u2, 2)) * math.sqrt(math.pow(v1, 2) + math.pow(v2, 2))
		degree = 180 - math.degrees(math.acos(numer/denom))
	except ValueError:
		print("ValueError encountered! Value dump:")
		print("vec1: " + str(vec1) + "\nvec2: " + str(vec2) + "\nvec3: " + str(vec3))
		print("u1: " + str(u1) + "\nv1: " + str(v1) + "\nu2: " + str(u2) + "\nv2: " + str(v2))
		print("numerator: " + str(numer) + "\ndenominator: " + str(denom) + "\ndegree: " + str(degree))
	except ZeroDivisionError:
		print("ZeroDivisionError encountered! Value dump:")
		print("vec1: " + str(vec1) + "\nvec2: " + str(vec2) + "\nvec3: " + str(vec3))
		print("u1: " + str(u1) + "\nv1: " + str(v1) + "\nu2: " + str(u2) + "\nv2: " + str(v2))
		print("numerator: " + str(numer) + "\ndenominator: " + str(denom) + "\ndegree: " + str(degree))

	return degree

if __name__ == "__main__":
	main()
