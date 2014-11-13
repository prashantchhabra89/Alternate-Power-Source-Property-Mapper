package com.powerplanner;

import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import javax.servlet.http.*;

@SuppressWarnings("serial")
public class PowerDBServlet extends HttpServlet {

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

		DatabaseFileFInder dbFind = new DatabaseFileFInder();
		String[] jsonFiles = new String[0];
		
		if (type.equals(PowerType.WIND.toString())) {
			jsonFiles = dbFind.windFileFinder(neLat, neLng, swLat, swLng, season);
			System.out.println("FETCHED GRID FILES: ");
			dbFind.displayWindReturnarr();			
		} else if (type.equals(PowerType.SOLAR.toString())) {
			switch(season) {
			case "dfj" :
				dbFind.solarFileFinder("Dec");
				dbFind.solarFileFinder("Jan");
				jsonFiles = dbFind.solarFileFinder("Feb");
				break;
			case "mam" :
				dbFind.solarFileFinder("Mar");
				dbFind.solarFileFinder("Apr");
				jsonFiles = dbFind.solarFileFinder("May");
				break;
			case "jja" :
				dbFind.solarFileFinder("Jun");
				dbFind.solarFileFinder("Jul");
				jsonFiles = dbFind.solarFileFinder("Aug");
				break;
			case "son" : 
				dbFind.solarFileFinder("Sep");
				dbFind.solarFileFinder("Oct");
				jsonFiles = dbFind.solarFileFinder("Nov");
				break;
			case "anu" :
			default :
				jsonFiles = dbFind.solarFileFinder("Anu");
				break;
			}
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
						dataBuilder.append("{\"grid\":{\"nelat\":");  
						dataBuilder.append(jsonFile.substring(0, 1));
						dataBuilder.append(",\"neLng\":");
						dataBuilder.append(jsonFile.substring(3, 6));
						dataBuilder.append(",\"swLat\":");
						dataBuilder.append(jsonFile.substring(8, 9));
						dataBuilder.append(",\"swLng\":");
						dataBuilder.append(jsonFile.substring(11, 14));
						dataBuilder.append(",\"sea\":");
						dataBuilder.append(jsonFile.substring(16, 18));
						
						dataBuilder.append("},\"data\":");
						dataBuilder.append(newData);
						dataBuilder.append("},");
					} else if (type.equals(PowerType.SOLAR.toString())) {
						dataBuilder.append(newData.substring(1, newData.length() - 1));
						dataBuilder.append(",");
					}
				}
			}
		}
		dataBuilder.deleteCharAt(dataBuilder.length() - 1);
		dataBuilder.append("]");
		
		String dataResponse = dataBuilder.toString();
		
		resp.setContentLength(dataResponse.length());
		resp.getOutputStream().write(dataResponse.getBytes());
		resp.getOutputStream().flush();
		resp.getOutputStream().close();
	}
}