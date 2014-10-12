package main.powercalc;

public class DataTuple {
	private int month;
	private double lat;
	private double lon;
	private double rawdata;
	private double calcdata;
	
	DataTuple() {
		this.month = 0;
		this.lat = 0.0;
		this.lon = 0.0;
		this.rawdata = 0.0;
		this.calcdata = 0.0;
	}
	
	DataTuple(int month, double lat, double lon, double rawdata, double calcdata) {
		this.month = month;
		this.lat = lat;
		this.lon = lon;
		this.rawdata = rawdata;
		this.calcdata = calcdata;
	}
	
	DataTuple(DataTuple dt) {
		this.month = dt.getMonth();
		this.lat = dt.getLat();
		this.lon = dt.getLon();
		this.rawdata = dt.getRawdata();
		this.calcdata = dt.getCalcdata();
	}

	/**
	 * @return the month
	 */
	public int getMonth() {
		return month;
	}

	/**
	 * @param month the month to set
	 */
	public void setMonth(int month) {
		this.month = month;
	}

	/**
	 * @return the lat
	 */
	public double getLat() {
		return lat;
	}

	/**
	 * @param lat the lat to set
	 */
	public void setLat(double lat) {
		this.lat = lat;
	}

	/**
	 * @return the lon
	 */
	public double getLon() {
		return lon;
	}

	/**
	 * @param lon the lon to set
	 */
	public void setLon(double lon) {
		this.lon = lon;
	}

	/**
	 * @return the rawdata
	 */
	public double getRawdata() {
		return rawdata;
	}

	/**
	 * @param rawdata the rawdata to set
	 */
	public void setRawdata(double rawdata) {
		this.rawdata = rawdata;
	}

	/**
	 * @return the calcdata
	 */
	public double getCalcdata() {
		return calcdata;
	}

	/**
	 * @param calcdata the calcdata to set
	 */
	public void setCalcdata(double calcdata) {
		this.calcdata = calcdata;
	}
}
