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

public class WindCalc {
	private DataTuple[] wind_5;
	private DataTuple[] wind_10;
	private DataTuple[] wind_15;
	private DataTuple[] testUse;
	
	public WindCalc() {
		this.wind_5 = null;
		this.wind_10 = null;
		this.wind_15 = null;
		this.testUse = null;
	}
	
	/**
	 * Calculates power for Wind.
	 * 
	 * @param topleftlat latitude value for top left corner of map
	 * @param topleftlon longitude value for top left corner of map
	 * @param btmrightlat latitude value for bottom right corner of map
	 * @param btmrightlon longitude value for bottom right corner of map
	 * @param efficiency efficiency of the wind turbines
	 * @param area rotor area of the wind turbines
	 * @param height height of the wind turbines
	 * @return array of DataTuple where the data is the calculated power
	 */
	public DataTuple[] powerCalc(double topleftlat, double topleftlon, double btmrightlat, double btmrightlon,
			double efficiency, double area, int height) {
		if(height == -1) {
			forTesting(topleftlat,topleftlon,btmrightlat,btmrightlon);
		}
		else if(this.wind_5 == null) {
			fromDatabase(topleftlat,topleftlon,btmrightlat,btmrightlon);		
		}
		
		DataTuple[] handle = null;
		
		switch(height) {
		case 5: handle = this.wind_5; break;
		case 10: handle = this.wind_10; break;
		case 15: handle = this.wind_15; break;
		default: handle = this.testUse; break;
		}
		
		DataTuple[] temp = new DataTuple[handle.length];
		
		for(int i = 0; i < handle.length; i++) {
			temp[i] = new DataTuple(handle[i].getMonth(),handle[i].getLat(),handle[i].getLon(),
					handle[i].getRawdata(),(handle[i].getCalcdata()*efficiency*area));
		}
		
		return temp;
	}
	
	private void fromDatabase(double topleftlat, double topleftlon, double btmrightlat, double btmrightlon) {
		try {
			SpreadsheetService service =
					new SpreadsheetService("WindDatabase");
			service.setUserCredentials("powerplanner.startup@gmail.com", "startupprogramming");

			URL SPREADSHEET_FEED_URL = new URL(
					"https://spreadsheets.google.com/feeds/spreadsheets/private/full");

			// Make a request to the API and get all spreadsheets.
			SpreadsheetFeed feed = service.getFeed(SPREADSHEET_FEED_URL,
					SpreadsheetFeed.class);
			List<SpreadsheetEntry> spreadsheets = feed.getEntries();

			SpreadsheetEntry spreadsheet = spreadsheets.get(0);

			// Get the first worksheet of the first spreadsheet.
			WorksheetFeed worksheetFeed = service.getFeed(
					spreadsheet.getWorksheetFeedUrl(), WorksheetFeed.class);
			List<WorksheetEntry> worksheets = worksheetFeed.getEntries();
			WorksheetEntry worksheet = worksheets.get(0);

			// Fetch the list feed of the worksheet.
			URL listFeedUrl = worksheet.getListFeedUrl();
			ListQuery query = new ListQuery(listFeedUrl);
			query.setSpreadsheetQuery("lat >= " + String.valueOf(btmrightlat) + " and lat <= " + String.valueOf(topleftlat)
					+ " and lon >= " + String.valueOf(topleftlon) + " and lon <= " + String.valueOf(btmrightlon));
			ListFeed listFeed = service.query(query, ListFeed.class);

			int i = 0;
			// Iterate through each row.
			for (ListEntry row : listFeed.getEntries()) {
				this.wind_5[i] = new DataTuple(Integer.parseInt(row.getCustomElements().getValue("season")),
						Double.parseDouble(row.getCustomElements().getValue("lat")), 
						Double.parseDouble(row.getCustomElements().getValue("lon")),
						Double.parseDouble(row.getCustomElements().getValue("ws5")),
						Double.parseDouble(row.getCustomElements().getValue("pre5")));
				this.wind_10[i] = new DataTuple(Integer.parseInt(row.getCustomElements().getValue("season")),
						Double.parseDouble(row.getCustomElements().getValue("lat")), 
						Double.parseDouble(row.getCustomElements().getValue("lon")),
						Double.parseDouble(row.getCustomElements().getValue("ws10")),
						Double.parseDouble(row.getCustomElements().getValue("pre10")));
				this.wind_15[i] = new DataTuple(Integer.parseInt(row.getCustomElements().getValue("season")),
						Double.parseDouble(row.getCustomElements().getValue("lat")), 
						Double.parseDouble(row.getCustomElements().getValue("lon")),
						Double.parseDouble(row.getCustomElements().getValue("ws15")),
						Double.parseDouble(row.getCustomElements().getValue("pre15")));
				i++;
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
	}
	
	private  void forTesting(double topleftlat, double topleftlon, double btmrightlat, double btmrightlon) {
		testUse = new DataTuple[4];
		testUse[0] = new DataTuple(1,topleftlat,topleftlon,1.0,0.5*Math.pow(1.0, 3)*1.24);
		testUse[1] = new DataTuple(1,topleftlat,btmrightlon,1.0,0.5*Math.pow(1.0, 3)*1.24);
		testUse[2] = new DataTuple(1,btmrightlat,topleftlon,1.0,0.5*Math.pow(1.0, 3)*1.24);
		testUse[3] = new DataTuple(1,btmrightlat,btmrightlon,1.0,0.5*Math.pow(1.0, 3)*1.24);
	}

}
