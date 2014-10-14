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
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		Filter minLat = new FilterPredicate("lat",FilterOperator.GREATER_THAN_OR_EQUAL,btmrightlat);
		Filter maxLat = new FilterPredicate("lat",FilterOperator.LESS_THAN_OR_EQUAL,topleftlat);
		Filter minLon = new FilterPredicate("lon",FilterOperator.GREATER_THAN_OR_EQUAL,btmrightlon);
		Filter maxLon = new FilterPredicate("lon",FilterOperator.LESS_THAN_OR_EQUAL,topleftlon);
		Filter boxRange = CompositeFilterOperator.and(minLat,maxLat,minLon,maxLon);
		
		Query q = new Query("Hydro").setFilter(boxRange);
		PreparedQuery pq = datastore.prepare(q);
		
		this.waterflow = new DataTuple[pq.countEntities(FetchOptions.Builder.withDefaults())];
		
		int i = 0;
		for (Entity result : pq.asIterable()) {
			this.waterflow[i] = new DataTuple((Integer)result.getProperty("month"),
					(Double)result.getProperty("lat"), (Double)result.getProperty("lon"),
					(Double)result.getProperty("speed"),(Double)result.getProperty("precalc"));
			i++;
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
