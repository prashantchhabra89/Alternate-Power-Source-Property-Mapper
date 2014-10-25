package com.powerplanner;

import java.io.IOException;

import javax.servlet.http.*;

import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;

import main.powercalc.DataTuple;
import main.powercalc.SolarCalc;
import main.powercalc.WindCalc;

@SuppressWarnings("serial")
public class PowerPlannerServlet extends HttpServlet {

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
		WindCalc wind_query = new WindCalc();
		SolarCalc solar_query = new SolarCalc();

		final String type = req.getParameter("type");
		final double neLat = Double.parseDouble(req.getParameter("neLat"));
		final double neLng = Double.parseDouble(req.getParameter("neLng"));
		final double swLat = Double.parseDouble(req.getParameter("swLat"));
		final double swLng = Double.parseDouble(req.getParameter("swLng"));

		JSONObject jsonifier;
		DataTuple[] retData = null;

		if (type.equals(PowerType.WIND.toString())) {
			retData = wind_query.powerCalc(neLat, swLng, swLat, neLng, 0.5, 2,
					15);
			System.out.println("Data fetched: " + retData.length);
		} else if (type.equals(PowerType.SOLAR.toString())) {
			retData = solar_query.powerCalc(neLat, swLng, swLat, neLng, 0.5, 2,
					0.75, 45);
			System.out.println("Data fetched: " + retData.length);
		} else {
			System.out.println("Error: Not currently set up for " + type
					+ " data.");
		}

		if (retData != null) {
			StringBuilder dataBuilder = new StringBuilder();
			dataBuilder.append("[");
			for (int i = 0; i < retData.length; i++) {
				jsonifier = new JSONObject();
				try {
					jsonifier.put("lat", retData[i].getLat());
					jsonifier.put("lng", retData[i].getLon());
					jsonifier.put("weight", retData[i].getCalcdata());
				} catch (JSONException e) {
					e.printStackTrace();
				}
				dataBuilder.append(jsonifier.toString());
				dataBuilder.append(",");
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
}