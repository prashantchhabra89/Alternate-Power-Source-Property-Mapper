package main.powercalc;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;

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
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		Filter minLat = new FilterPredicate("lat",FilterOperator.GREATER_THAN_OR_EQUAL,btmrightlat);
		Filter maxLat = new FilterPredicate("lat",FilterOperator.LESS_THAN_OR_EQUAL,topleftlat);
		Filter minLon = new FilterPredicate("lon",FilterOperator.GREATER_THAN_OR_EQUAL,btmrightlon);
		Filter maxLon = new FilterPredicate("lon",FilterOperator.LESS_THAN_OR_EQUAL,topleftlon);
		Filter boxRange = CompositeFilterOperator.and(minLat,maxLat,minLon,maxLon);
		
		Query q = new Query("Wind").setFilter(boxRange);
		PreparedQuery pq = datastore.prepare(q);
		
		this.wind_5 = new DataTuple[pq.countEntities(FetchOptions.Builder.withDefaults())];
		this.wind_10 = new DataTuple[pq.countEntities(FetchOptions.Builder.withDefaults())];
		this.wind_15 = new DataTuple[pq.countEntities(FetchOptions.Builder.withDefaults())];
		
		int i = 0;
		for (Entity result : pq.asIterable()) {
			this.wind_5[i] = new DataTuple((Integer)result.getProperty("month"),
					(Double)result.getProperty("lat"), (Double)result.getProperty("lon"),
					(Double)result.getProperty("ws_5"),(Double)result.getProperty("pre_5"));
			this.wind_10[i] = new DataTuple((Integer)result.getProperty("month"),
					(Double)result.getProperty("lat"), (Double)result.getProperty("lon"),
					(Double)result.getProperty("ws_10"),(Double)result.getProperty("pre_10"));
			this.wind_15[i] = new DataTuple((Integer)result.getProperty("month"),
					(Double)result.getProperty("lat"), (Double)result.getProperty("lon"),
					(Double)result.getProperty("ws_15"),(Double)result.getProperty("pre_15"));
			i++;
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
