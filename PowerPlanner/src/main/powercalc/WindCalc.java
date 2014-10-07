package main.powercalc;

public class WindCalc {
	private DataTuple[] windspeed;
	private int height;
	
	public WindCalc() {
		this.windspeed = null;
		this.height = 0;
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
	public DataTuple[] powerCalc(double topleftlat, double topleftlon, double btmrightlat, double btmrightlon, double efficiency, double area, int height) {
		if(height == -1)
			windspeed = forTesting(topleftlat,topleftlon,btmrightlat,btmrightlon);
		else if(windspeed == null || this.height != height) {
			this.height = height;
			windspeed = fromDatabase(topleftlat,topleftlon,btmrightlat,btmrightlon,height);
			
		}
		
		// May change
		double density = 0.0;
		if(height == 5)
			density = 1.226;
		else if(height == 10)
			density = 1.225;
		else
			density = 1.224;
		
		DataTuple[] temp = new DataTuple[windspeed.length];
		
		for(int i = 0; i < windspeed.length; i++) {
			temp[i] = new DataTuple(windspeed[i].getLat(),windspeed[i].getLon(),(0.5*Math.pow(windspeed[i].getData(),3)*efficiency*area*density));
		}
		
		return temp;
	}
	
	// TODO
	private DataTuple[] fromDatabase(double topleftlat, double topleftlon, double btmrightlat, double btmrightlon, int height) {
		return null;
	}
	
	private  DataTuple[] forTesting(double topleftlat, double topleftlon, double btmrightlat, double btmrightlon) {
		DataTuple[] temp = new DataTuple[4];
		temp[0] = new DataTuple(topleftlat,topleftlon,1.0);
		temp[1] = new DataTuple(topleftlat,btmrightlon,1.0);
		temp[2] = new DataTuple(btmrightlat,topleftlon,1.0);
		temp[3] = new DataTuple(btmrightlat,btmrightlon,1.0);
		return temp;
	}

}
