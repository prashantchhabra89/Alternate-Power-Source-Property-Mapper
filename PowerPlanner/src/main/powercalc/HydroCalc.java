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

public class HydroCalc {
	private DataTuple[] waterflow;
	private DataTuple[] testUse;
	
	public HydroCalc() {
		this.waterflow = null;
		this.testUse = null;
	}
	
	/**
	 * Calculates power for Hydro.
	 * 
	 * @param topleftlat latitude value for top left corner of map
	 * @param topleftlon longitude value for top left corner of map
	 * @param btmrightlat latitude value for bottom right corner of map
	 * @param btmrightlon longitude value for bottom right corner of map
	 * @param efficiency hydraulic efficiency of the water turbines
	 * @param heightdiff height difference between inlet and outlet
	 * @return array of DataTuple where the data is the calculated power
	 */
	public DataTuple[] powerCalc(double topleftlat, double topleftlon, double btmrightlat, double btmrightlon,
			double efficiency, double heightdiff) {
		DataTuple[] handle = null;
		if(heightdiff == -1) {
			heightdiff = 1;
			forTesting(topleftlat,topleftlon,btmrightlat,btmrightlon);
			handle = testUse;
		}
		else if(this.waterflow == null) {
			fromDatabase(topleftlat,topleftlon,btmrightlat,btmrightlon);
			handle = this.waterflow;
		}
		else
			handle = this.waterflow;
		
		DataTuple[] temp = new DataTuple[handle.length];
		
		for(int i = 0; i < handle.length; i++) {
			temp[i] = new DataTuple(handle[i].getMonth(),handle[i].getLat(),handle[i].getLon(),
					handle[i].getRawdata(),(handle[i].getCalcdata()*efficiency*heightdiff));
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

			SpreadsheetEntry spreadsheet = spreadsheets.get(0);

			// Get the first worksheet of the first spreadsheet.
			WorksheetFeed worksheetFeed = service.getFeed(
					spreadsheet.getWorksheetFeedUrl(), WorksheetFeed.class);
			List<WorksheetEntry> worksheets = worksheetFeed.getEntries();
			WorksheetEntry worksheet = worksheets.get(0);

			// Fetch the list feed of the worksheet.
			URL listFeedUrl = worksheet.getListFeedUrl();
			ListQuery query = new ListQuery(listFeedUrl);
			query.setSpreadsheetQuery("lat >= " + btmrightlat + " and lat <= " + topleftlat
					+ " and lon >= " + btmrightlon + " and lon <= " + topleftlon);
			ListFeed listFeed = service.query(query, ListFeed.class);

			int i = 0;
			// Iterate through each row.
			for (ListEntry row : listFeed.getEntries()) {
				this.waterflow[i] = new DataTuple(Integer.parseInt(row.getCustomElements().getValue("month")),
						Double.parseDouble(row.getCustomElements().getValue("lat")), 
						Double.parseDouble(row.getCustomElements().getValue("lon")),
						Double.parseDouble(row.getCustomElements().getValue("speed")),
						Double.parseDouble(row.getCustomElements().getValue("precalc")));
				i++;
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
	}

	private  void forTesting(double topleftlat, double topleftlon, double btmrightlat, double btmrightlon) {
		this.testUse = new DataTuple[4];
		this.testUse[0] = new DataTuple(1,topleftlat,topleftlon,1.0,1.0*1000.0*9.81);
		this.testUse[1] = new DataTuple(1,topleftlat,btmrightlon,1.0,1.0*1000.0*9.81);
		this.testUse[2] = new DataTuple(1,btmrightlat,topleftlon,1.0,1.0*1000.0*9.81);
		this.testUse[3] = new DataTuple(1,btmrightlat,btmrightlon,1.0,1.0*1000.0*9.81);
	}
}
