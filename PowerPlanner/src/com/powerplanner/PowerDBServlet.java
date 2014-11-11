package com.powerplanner;

import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import javax.servlet.http.*;

import main.powercalc.DatabaseFileFInder;

@SuppressWarnings("serial")
public class PowerDBServlet extends HttpServlet {

	private boolean sendStreams = true;
	
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
			System.out.println("FETCHED GRID FILES: ");
			dbFind.displaySolarFileList();	
		} else if (type.equals(PowerType.HYDRO.toString())) {
			switch(season) {
			case "dfj" :
				dbFind.hydroFileFinder("Dec", sendStreams);
				dbFind.hydroFileFinder("Jan", sendStreams);
				jsonFiles = dbFind.hydroFileFinder("Feb", sendStreams);
				break;
			case "mam" :
				dbFind.hydroFileFinder("Mar", sendStreams);
				dbFind.hydroFileFinder("Apr", sendStreams);
				jsonFiles = dbFind.hydroFileFinder("May", sendStreams);
				break;
			case "jja" :
				dbFind.hydroFileFinder("Jun", sendStreams);
				dbFind.hydroFileFinder("Jul", sendStreams);
				jsonFiles = dbFind.hydroFileFinder("Aug", sendStreams);
				break;
			case "son" : 
				dbFind.hydroFileFinder("Sep", sendStreams);
				dbFind.hydroFileFinder("Oct", sendStreams);
				jsonFiles = dbFind.hydroFileFinder("Nov", sendStreams);
				break;
			case "anu" :
			default :
				jsonFiles = dbFind.hydroFileFinder("Anu", sendStreams);
				break;
			}
			System.out.println("FETCHED GRID FILES: ");
			dbFind.displayHydroFileList();	
			//sendStreams = false;
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
					dataBuilder.append(newData.substring(1, newData.length() - 1));
					dataBuilder.append(",");
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