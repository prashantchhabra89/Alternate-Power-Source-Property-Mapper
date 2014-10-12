package main.powercalc;

import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Entity;


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
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		Filter minLat = new FilterPredicate("lat",FilterOperator.GREATER_THAN_OR_EQUAL,btmrightlat);
		Filter maxLat = new FilterPredicate("lat",FilterOperator.LESS_THAN_OR_EQUAL,topleftlat);
		Filter minLon = new FilterPredicate("lon",FilterOperator.GREATER_THAN_OR_EQUAL,btmrightlon);
		Filter maxLon = new FilterPredicate("lon",FilterOperator.LESS_THAN_OR_EQUAL,topleftlon);
		Filter boxRange = CompositeFilterOperator.and(minLat,maxLat,minLon,maxLon);
		
		Query q = new Query("Solar").setFilter(boxRange);
		PreparedQuery pq = datastore.prepare(q);

		this.sunlight_0 = new DataTuple[pq.countEntities(FetchOptions.Builder.withDefaults())];
		this.sunlight_30 = new DataTuple[pq.countEntities(FetchOptions.Builder.withDefaults())];
		this.sunlight_45 = new DataTuple[pq.countEntities(FetchOptions.Builder.withDefaults())];
		this.sunlight_60 = new DataTuple[pq.countEntities(FetchOptions.Builder.withDefaults())];
		this.sunlight_90 = new DataTuple[pq.countEntities(FetchOptions.Builder.withDefaults())];
		this.sunlight_360 = new DataTuple[pq.countEntities(FetchOptions.Builder.withDefaults())];
		
		int i = 0;
		for (Entity result : pq.asIterable()) {
			this.sunlight_0[i] = new DataTuple((Integer)result.getProperty("month"),
					(Double)result.getProperty("lat"), (Double)result.getProperty("lon"),
					(Double)result.getProperty("deg_0"),(Double)result.getProperty("deg_0"));
			this.sunlight_30[i] = new DataTuple((Integer)result.getProperty("month"),
					(Double)result.getProperty("lat"), (Double)result.getProperty("lon"),
					(Double)result.getProperty("deg_30"),(Double)result.getProperty("deg_30"));
			this.sunlight_45[i] = new DataTuple((Integer)result.getProperty("month"),
					(Double)result.getProperty("lat"), (Double)result.getProperty("lon"),
					(Double)result.getProperty("deg_45"),(Double)result.getProperty("deg_45"));
			this.sunlight_60[i] = new DataTuple((Integer)result.getProperty("month"),
					(Double)result.getProperty("lat"), (Double)result.getProperty("lon"),
					(Double)result.getProperty("deg_60"),(Double)result.getProperty("deg_60"));
			this.sunlight_90[i] = new DataTuple((Integer)result.getProperty("month"),
					(Double)result.getProperty("lat"), (Double)result.getProperty("lon"),
					(Double)result.getProperty("deg_90"),(Double)result.getProperty("deg_90"));
			this.sunlight_360[i] = new DataTuple((Integer)result.getProperty("month"),
					(Double)result.getProperty("lat"), (Double)result.getProperty("lon"),
					(Double)result.getProperty("deg_360"),(Double)result.getProperty("deg_360"));
			i++;
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
