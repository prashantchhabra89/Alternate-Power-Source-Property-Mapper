package com.powerplanner;

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

		final double neLat = Double.parseDouble(req.getParameter("neLat"));
		final double neLng = Double.parseDouble(req.getParameter("neLng"));
		final double swLat = Double.parseDouble(req.getParameter("swLat"));
		final double swLng = Double.parseDouble(req.getParameter("swLng"));

		DatabaseFileFInder dbFind = new DatabaseFileFInder();
		String[] jsonFiles = dbFind.windFileFinder(neLat, neLng, swLat, swLng, "anu");
		//System.out.println("Servlet got: " + jsonFiles.toString());
		
		//System.out.print("Displaying: ");
		//dbFind.displayWindReturnarr();
		
		for (String jsonFile : jsonFiles) {
			if (jsonFile != null) {
				System.out.println(jsonFile);
			}
			//BufferedReader br = new BufferedReader(new FileReader(jsonFile));
			//for (String line; (line = br.readLine()) != null;) {
			//	System.out.print(line);
			//}
			//br.close();
		}
		
		String dataResponse = "";
		resp.setContentLength(dataResponse.length());
		resp.getOutputStream().write(dataResponse.getBytes());
		resp.getOutputStream().flush();
		resp.getOutputStream().close();
	}
}