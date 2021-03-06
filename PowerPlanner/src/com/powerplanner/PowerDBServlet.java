package com.powerplanner;

import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.*;

import main.powercalc.DatabaseFileFinder;

@SuppressWarnings("serial")
public class PowerDBServlet extends HttpServlet {
	
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
	}

	/**
	 * Post request for data. Request is expected to contain several
	 * parameters, including:
	 * 'type' - Valid Values: WIND, SOLAR, HYDRO
	 * 'neLat' - Valid Values: -90.0 to 90.0
	 * 'swLat' 				''
	 * 'neLng' - Valid Values: -180.0 to 180.0
	 * 'swLng' 				''
	 * 
	 * Sends a JSON formatted response with 'lat', 'lng', and 'weight'
	 * parameters. 'lat' and 'lng' will fall within the bounds specified
	 * in the request parameters.
	 */
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {

		final String type = req.getParameter("type");
		final double neLat = Double.parseDouble(req.getParameter("neLat"));
		final double neLng = Double.parseDouble(req.getParameter("neLng"));
		final double swLat = Double.parseDouble(req.getParameter("swLat"));
		final double swLng = Double.parseDouble(req.getParameter("swLng"));
		final String season = req.getParameter("season");

		DatabaseFileFinder dbFind = new DatabaseFileFinder();
		String[] jsonFiles = new String[0];
		
		if (type.equals(PowerType.WIND.toString())) {
			jsonFiles = dbFind.windFileFinder(neLat, neLng, swLat, swLng, season);
			System.out.println("FETCHED GRID FILES: ");
			dbFind.displayWindReturnarr();			
		} else if (type.equals(PowerType.SOLAR.toString())) {
			jsonFiles = dbFind.solarFileFinder(season);
			System.out.println("FETCHED GRID FILES: ");
			dbFind.displaySolarFileList();	
		} else if (type.equals(PowerType.HYDRO.toString())) {
			jsonFiles = dbFind.hydroFileFinder(neLat, neLng, swLat, swLng, season);
			System.out.println("FETCHED GRID FILES: ");
			dbFind.displayHydroFileList();	
		}

		StringBuilder dataBuilder = new StringBuilder();
		dataBuilder.append("[");
		
		for (String jsonFile : jsonFiles) {
			if (jsonFile != null) {
				File jFile = new File(jsonFile);
				FileInputStream jfIn = new FileInputStream(jFile);
				byte[] buffer = new byte[(int) jFile.length()];
				new DataInputStream(jfIn).readFully(buffer);
				String newData = new String(buffer, "UTF-8");
				jfIn.close();
				if (newData.length() > 1) {
					if (type.equals(PowerType.WIND.toString())) {
						int file_neLat = 0;
						int file_swLat = 0;
						int file_neLng = 0;
						int file_swLng = 0;
						
						Pattern boundaryP = Pattern.compile("^[^\\d]*([-]?\\d+)_([-]?\\d+)_([-]?\\d+)_([-]?\\d+)_(\\w)+.*$");
						Matcher boundaryM = boundaryP.matcher(jsonFile);
						if (!boundaryM.matches()) {
							continue;
						} else {
							file_neLat = Integer.parseInt(boundaryM.group(1));
							file_swLat = Integer.parseInt(boundaryM.group(3));
							file_neLng = Integer.parseInt(boundaryM.group(2));
							file_swLng = Integer.parseInt(boundaryM.group(4));
						}
						dataBuilder.append("{\"grid\":{\"neLat\":");  
						dataBuilder.append(file_neLat);
						dataBuilder.append(",\"neLng\":");
						dataBuilder.append(file_neLng);
						dataBuilder.append(",\"swLat\":");
						dataBuilder.append(file_swLat);
						dataBuilder.append(",\"swLng\":");
						dataBuilder.append(file_swLng);
						
						dataBuilder.append("},\"data\":");
						dataBuilder.append(newData);
						dataBuilder.append("},");
					} else if (type.equals(PowerType.HYDRO.toString())) {
						int file_neLat = 0;
						int file_swLat = 0;
						int file_neLng = 0;
						int file_swLng = 0;
						
						Pattern boundaryP = Pattern.compile("^[^\\d]*(\\w)+_([-]?\\d+)_([-]?\\d+)_([-]?\\d+)_([-]?\\d+).*$");
						Matcher boundaryM = boundaryP.matcher(jsonFile);
						if (!boundaryM.matches()) {
							continue;
						} else {
							file_neLat = Integer.parseInt(boundaryM.group(2));
							file_swLat = Integer.parseInt(boundaryM.group(4));
							file_neLng = Integer.parseInt(boundaryM.group(3));
							file_swLng = Integer.parseInt(boundaryM.group(5));

							dataBuilder.append("{\"grid\":{\"neLat\":");  
							dataBuilder.append(file_neLat);
							dataBuilder.append(",\"neLng\":");
							dataBuilder.append(file_neLng);
							dataBuilder.append(",\"swLat\":");
							dataBuilder.append(file_swLat);
							dataBuilder.append(",\"swLng\":");
							dataBuilder.append(file_swLng);
							
							dataBuilder.append("},\"data\":");
							dataBuilder.append(newData);
							dataBuilder.append("},");
						}
					} else {
						dataBuilder.append(newData.substring(1, newData.length() - 1));
						dataBuilder.append(",");
					}
				}
			}
		}
		if (dataBuilder.length() > 1) {
			dataBuilder.deleteCharAt(dataBuilder.length() - 1);
		}
		dataBuilder.append("]");
		
		String dataResponse = dataBuilder.toString();

		resp.setContentLength(dataResponse.length());
		resp.getOutputStream().write(dataResponse.getBytes());
		resp.getOutputStream().flush();
		resp.getOutputStream().close();
	}
}
