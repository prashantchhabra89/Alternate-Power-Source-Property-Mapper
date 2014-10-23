package main.powercalc;

import java.net.URL;
import java.util.List;

import com.google.gdata.client.spreadsheet.ListQuery;
import com.google.gdata.client.spreadsheet.SpreadsheetService;
import com.google.gdata.data.spreadsheet.ListEntry;
import com.google.gdata.data.spreadsheet.ListFeed;
import com.google.gdata.data.spreadsheet.SpreadsheetEntry;
import com.google.gdata.data.spreadsheet.SpreadsheetFeed;
import com.google.gdata.data.spreadsheet.WorksheetEntry;
import com.google.gdata.data.spreadsheet.WorksheetFeed;


public class SolarCalc {
	private DataTuple[] sunlight_0;
	private DataTuple[] sunlight_30;
	private DataTuple[] sunlight_45;
	private DataTuple[] sunlight_60;
	private DataTuple[] sunlight_90;
	private DataTuple[] sunlight_360;
	private DataTuple[] testUse;
	
	public SolarCalc() {
		this.sunlight_0 = null;
		this.sunlight_30 = null;
		this.sunlight_45 = null;
		this.sunlight_60 = null;
		this.sunlight_90 = null;
		this.sunlight_360 = null;
		this.testUse = null;
	}

	/**
	 * Calculates power for Solar.
	 * 
	 * @param topleftlat latitude value for top left corner of map
	 * @param topleftlon longitude value for top left corner of map
	 * @param btmrightlat latitude value for bottom right corner of map
	 * @param btmrightlon longitude value for bottom right corner of map
	 * @param efficiency efficiency of the solar panels
	 * @param area total area of the solar panels
	 * @param losses coefficient for losses; for default value put 0.75
	 * @param tilt angle of solar panels' tilt with respect to latitude
	 * @return array of DataTuple where the data is the calculated power
	 */
	public DataTuple[] powerCalc(double topleftlat, double topleftlon, double btmrightlat, double btmrightlon,
			double efficiency, double area, double losses, int tilt) {
		if(tilt == -1) {
			forTesting(topleftlat,topleftlon,btmrightlat,btmrightlon);
		}
		else if(this.sunlight_0 == null) {
			fromDatabase(topleftlat,topleftlon,btmrightlat,btmrightlon);
		}
		
		DataTuple[] handle = null;
		
		switch(tilt) {
		case 0: handle = this.sunlight_0; break;
		case 30: handle = this.sunlight_30; break;
		case 45: handle = this.sunlight_45; break;
		case 60: handle = this.sunlight_60; break;
		case 90: handle = this.sunlight_90; break;
		case 360: handle = this.sunlight_360; break;
		default: handle = this.testUse; break;
		}
		
		DataTuple[] temp = new DataTuple[handle.length];
		
		for(int i = 0; i < handle.length; i++) {
			temp[i] = new DataTuple(handle[i].getMonth(), handle[i].getLat(),handle[i].getLon(),
					handle[i].getRawdata(),(handle[i].getCalcdata()*efficiency*area*losses));
		}
		
		return temp;
	}
	
	private void fromDatabase(double topleftlat, double topleftlon, double btmrightlat, double btmrightlon) {
		try {
			SpreadsheetService service =
					new SpreadsheetService("SolarDatabase");
			service.setUserCredentials("powerplanner.startup@gmail.com", "startupprogramming");

			URL SPREADSHEET_FEED_URL = new URL(
					"https://spreadsheets.google.com/feeds/spreadsheets/private/full");

			// Make a request to the API and get all spreadsheets.
			SpreadsheetFeed feed = service.getFeed(SPREADSHEET_FEED_URL,
					SpreadsheetFeed.class);
			List<SpreadsheetEntry> spreadsheets = feed.getEntries();

			SpreadsheetEntry spreadsheet = spreadsheets.get(2);

			// Get the first worksheet of the first spreadsheet.
			WorksheetFeed worksheetFeed = service.getFeed(
					spreadsheet.getWorksheetFeedUrl(), WorksheetFeed.class);
			List<WorksheetEntry> worksheets = worksheetFeed.getEntries();
			WorksheetEntry worksheet = worksheets.get(0);

			// Fetch the list feed of the worksheet.
			URL listFeedUrl = worksheet.getListFeedUrl();
			ListQuery query = new ListQuery(listFeedUrl);
			query.setSpreadsheetQuery("lat >= " + String.valueOf(btmrightlat)
					+ " and lat <= " + String.valueOf(topleftlat)
					+ " and lon <= " + String.valueOf(btmrightlon)
					+ " and lon >= " + String.valueOf(topleftlon));
			ListFeed listFeed = service.query(query, ListFeed.class);

			int i = 0;
			// Iterate through each row.
			for (ListEntry row : listFeed.getEntries()) {
				this.sunlight_0[i] = new DataTuple(Integer.parseInt(row.getCustomElements().getValue("month")),
						Double.parseDouble(row.getCustomElements().getValue("lat")), 
						Double.parseDouble(row.getCustomElements().getValue("lon")),
						Double.parseDouble(row.getCustomElements().getValue("deg0")),
						Double.parseDouble(row.getCustomElements().getValue("deg0")));
				this.sunlight_30[i] = new DataTuple(Integer.parseInt(row.getCustomElements().getValue("month")),
						Double.parseDouble(row.getCustomElements().getValue("lat")), 
						Double.parseDouble(row.getCustomElements().getValue("lon")),
						Double.parseDouble(row.getCustomElements().getValue("deg30")),
						Double.parseDouble(row.getCustomElements().getValue("deg30")));
				this.sunlight_45[i] = new DataTuple(Integer.parseInt(row.getCustomElements().getValue("month")),
						Double.parseDouble(row.getCustomElements().getValue("lat")), 
						Double.parseDouble(row.getCustomElements().getValue("lon")),
						Double.parseDouble(row.getCustomElements().getValue("deg45")),
						Double.parseDouble(row.getCustomElements().getValue("deg45")));
				this.sunlight_60[i] = new DataTuple(Integer.parseInt(row.getCustomElements().getValue("month")),
						Double.parseDouble(row.getCustomElements().getValue("lat")), 
						Double.parseDouble(row.getCustomElements().getValue("lon")),
						Double.parseDouble(row.getCustomElements().getValue("deg60")),
						Double.parseDouble(row.getCustomElements().getValue("deg60")));
				this.sunlight_90[i] = new DataTuple(Integer.parseInt(row.getCustomElements().getValue("month")),
						Double.parseDouble(row.getCustomElements().getValue("lat")), 
						Double.parseDouble(row.getCustomElements().getValue("lon")),
						Double.parseDouble(row.getCustomElements().getValue("deg90")),
						Double.parseDouble(row.getCustomElements().getValue("deg90")));
				this.sunlight_360[i] = new DataTuple(Integer.parseInt(row.getCustomElements().getValue("month")),
						Double.parseDouble(row.getCustomElements().getValue("lat")), 
						Double.parseDouble(row.getCustomElements().getValue("lon")),
						Double.parseDouble(row.getCustomElements().getValue("deg360")),
						Double.parseDouble(row.getCustomElements().getValue("deg360")));
				i++;
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
	}

	private void forTesting(double topleftlat, double topleftlon, double btmrightlat, double btmrightlon) {
		this.testUse = new DataTuple[4];
		this.testUse[0] = new DataTuple(1, topleftlat,topleftlon,1.0,1.0);
		this.testUse[1] = new DataTuple(1, topleftlat,btmrightlon,1.0,1.0);
		this.testUse[2] = new DataTuple(1, btmrightlat,topleftlon,1.0,1.0);
		this.testUse[3] = new DataTuple(1, btmrightlat,btmrightlon,1.0,1.0);
	}
}
