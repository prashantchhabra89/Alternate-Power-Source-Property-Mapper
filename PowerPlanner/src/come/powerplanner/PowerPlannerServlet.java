package come.powerplanner;

import java.io.IOException;
import java.util.ArrayList;

import javax.servlet.http.*;

import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;

import main.powercalc.DataTuple;

@SuppressWarnings("serial")
public class PowerPlannerServlet extends HttpServlet {
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		final String type = req.getParameter("type");
		final double neLat = Double.parseDouble(req.getParameter("neLat"));
		final double neLng = Double.parseDouble(req.getParameter("neLng"));
		final double swLat = Double.parseDouble(req.getParameter("swLat"));
		final double swLng = Double.parseDouble(req.getParameter("swLng"));

		JSONObject jsonifier;

		final ArrayList<DataTuple> retData = getFakeData(
				PowerType.valueOf(type), neLat, neLng, swLat, swLng);

		StringBuilder dataBuilder = new StringBuilder();
		dataBuilder.append("[");
		for (DataTuple dt : retData) {
			jsonifier = new JSONObject();
			try {
				jsonifier.put("lat", dt.getLat());
				jsonifier.put("lng", dt.getLon());
				jsonifier.put("weight", dt.getCalcdata());
			} catch (JSONException e) {
				e.printStackTrace();
			}
			dataBuilder.append(jsonifier.toString());
			dataBuilder.append(",");
		}
		dataBuilder.deleteCharAt(dataBuilder.length()-1);
		dataBuilder.append("]");
		
		String dataResponse = dataBuilder.toString();
		
		resp.setContentLength(dataResponse.length());
		resp.getOutputStream().write(dataResponse.getBytes());
		resp.getOutputStream().flush();
		resp.getOutputStream().close();
	}

	/**
	 * Temporary method for generating fake server data.
	 * 
	 * @param pType
	 * @param neLat
	 * @param neLng
	 * @param swLat
	 * @param swLng
	 * @return
	 */
	private ArrayList<DataTuple> getFakeData(PowerType pType, double neLat,
			double neLng, double swLat, double swLng) {
		final int staticMonth = 0;
		final double rawData = 0.0;
		final double offset = 0.00075;

		final double latIncr = 0.00075;
		final double lngIncr = 0.00225;

		ArrayList<DataTuple> dataPoints = new ArrayList<DataTuple>();

		switch (pType) {
		case WIND:
			for (double i = 0.0; i <= (neLat - swLat); i += latIncr) {
				for (double j = 0.0; j <= (neLng - swLng); j += lngIncr) {
					if (Math.random() > 0.45) {
						double weighted = (Math.random() / 2.5);
						DataTuple dt = new DataTuple(staticMonth, swLat + i,
								swLng + j + offset, rawData, weighted);
						dataPoints.add(dt);
					}
				}
			}
			break;
		case SOLAR:
			for (double i = 0.0; i <= (neLat - swLat); i += latIncr) {
				for (double j = 0.0; j <= (neLng - swLng); j += lngIncr) {
					if (Math.random() > 0.1) {
						double weighted = (Math.random() / 4) + 0.025;
						DataTuple dt = new DataTuple(staticMonth, swLat + i,
								swLng + j + offset, rawData, weighted);
						dataPoints.add(dt);
					}
				}
			}
			break;
		case HYDRO:
			for (double i = 0.0; i <= (neLat - swLat); i += latIncr) {
				for (double j = 0.0; j <= (neLng - swLng); j += lngIncr) {
					if (Math.random() > 0.9) {
						double weighted = (Math.random() / 2) + 0.04;
						DataTuple dt = new DataTuple(staticMonth, swLat + i,
								swLng + j + offset, rawData, weighted);
						dataPoints.add(dt);
					}
				}
			}
			break;
		}

		return dataPoints;
	}
}