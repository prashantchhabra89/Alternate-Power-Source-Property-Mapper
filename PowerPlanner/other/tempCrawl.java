
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.util.Scanner;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class tempCrawl {
	private static final int numOfFiles = 360; // 360 files to be processed in total: 30 years of 12 months
	private static final int totalStationNumber = 9520; // all stations. Contains 4260 valid stations and 5260 invalid stations.


	// a private class "Station" to represent a Station object.
	// A Station object store latitute, longitude, seasonal average, annual average.
	// grid number and mask value are thrown away.
	private static class Station {
		private double lat;
		private double lon;
		private double springAvg;
		private double summerAvg;
		private double fallAvg;
		private double winterAvg;
		private double annualAvg;
		private int springValidDataCount;
		private int summerValidDataCount;
		private int fallValidDataCount;
		private int winterValidDataCount;
		
		Station(double lat, double lon) {
			this.lat = lat;
			this.lon = lon;
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
		@SuppressWarnings("unused")
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
		@SuppressWarnings("unused")
		public void setLon(double lon) {
			this.lon = lon;
		}
		/**
		 * @return the springAvg
		 */
		public double getSpringAvg() {
			return springAvg;
		}
		/**
		 * @param springAvg the springAvg to set
		 */
		public void setSpringAvg(double springAvg) {
			this.springAvg = springAvg;
		}
		/**
		 * @return the summerAvg
		 */
		public double getSummerAvg() {
			return summerAvg;
		}
		/**
		 * @param summerAvg the summerAvg to set
		 */
		public void setSummerAvg(double summerAvg) {
			this.summerAvg = summerAvg;
		}
		/**
		 * @return the fallAvg
		 */
		public double getFallAvg() {
			return fallAvg;
		}
		/**
		 * @param fallAvg the fallAvg to set
		 */
		public void setFallAvg(double fallAvg) {
			this.fallAvg = fallAvg;
		}
		/**
		 * @return the winterAvg
		 */
		public double getWinterAvg() {
			return winterAvg;
		}
		/**
		 * @param winterAvg the winterAvg to set
		 */
		public void setWinterAvg(double winterAvg) {
			this.winterAvg = winterAvg;
		}
		/**
		 * @return the annualAvg
		 */
		public double getAnnualAvg() {
			return annualAvg;
		}
		/**
		 * @param annualAvg the annualAvg to set
		 */
		public void setAnnualAvg(double annualAvg) {
			this.annualAvg = annualAvg;
		}

		/**
		 * @return the springValidDataCount
		 */
		public int getSpringValidDataCount() {
			return springValidDataCount;
		}
		/**
		 * @param springValidDataCount the springValidDataCount to set
		 */
		public void setSpringValidDataCount(int springValidDataCount) {
			this.springValidDataCount = springValidDataCount;
		}
		/**
		 * @return the summerValidDataCount
		 */
		public int getSummerValidDataCount() {
			return summerValidDataCount;
		}
		/**
		 * @param summerValidDataCount the summerValidDataCount to set
		 */
		public void setSummerValidDataCount(int summerValidDataCount) {
			this.summerValidDataCount = summerValidDataCount;
		}
		/**
		 * @return the fallValidDataCount
		 */
		public int getFallValidDataCount() {
			return fallValidDataCount;
		}
		/**
		 * @param fallValidDataCount the fallValidDataCount to set
		 */
		public void setFallValidDataCount(int fallValidDataCount) {
			this.fallValidDataCount = fallValidDataCount;
		}
		/**
		 * @return the winterValidDataCount
		 */
		public int getWinterValidDataCount() {
			return winterValidDataCount;
		}
		/**
		 * @param winterValidDataCount the winterValidDataCount to set
		 */
		public void setWinterValidDataCount(int winterValidDataCount) {
			this.winterValidDataCount = winterValidDataCount;
		}	
	}
	
	// a class used to round decimals to a certain digits.
	private static BigDecimal truncateDecimal(double x,int numberofDecimals)
	{
	    if ( x > 0) {
	        return new BigDecimal(String.valueOf(x)).setScale(numberofDecimals, BigDecimal.ROUND_FLOOR);
	    } else {
	        return new BigDecimal(String.valueOf(x)).setScale(numberofDecimals, BigDecimal.ROUND_CEILING);
	    }
	}
	
	public static void main(String[] args) {
		try {
			String inputLine; // the line scanned from the T519****.TXT file.
			String[] separatedLine; // this is used to split inputLine into tokens separated by spaces.
			File file = new File("/home/charlie/Documents/485/originalData/T5196101.TXT"); // change this location according to your machine.
			Scanner file196101 = new Scanner(file);
			int stationNumber = 0; // used to iterate through the Station Object array.
			Station[] stationList = new Station[totalStationNumber]; // an array storing all those 9520 stations.
			while(file196101.hasNextLine()) {
				// if we go into this loop, there are new lines here, which means we have data for a new station.
				// ideally if there is no mistake in our input data file, we can also say
				// for int i = 0; i < 9520; i++, because we know there is gonna be 9520 lines.
				inputLine = file196101.nextLine();				
				separatedLine = inputLine.split("\\s+"); // split inputLine by spaces. Note that the regular expression s+ is used, because
				// the number of spaces between different terms in inputLine is different.
				
				// ATTENTION:
				// 1 row has 7 elements; but separatedLine[0] contains nothing, i.e. separateLine[1] = first number in inputLine.
				// I have no idea why this is happening.
				// Just remember: for inputLine & separateLine[], array index starts with 1!!!
				// separatedLine[3]: latitute
				// separatedLine[4]: longitude
				stationList[stationNumber] = new Station(Double.parseDouble(separatedLine[3]), 
						Double.parseDouble(separatedLine[4]));
				stationNumber++;
			}
			file196101.close();
			
			// by now, all stations are created. Now, calculate seasonal data.
			// put everything in a zip file. Easier to handle files and I/O.
			InputStream input = new FileInputStream("/home/charlie/Documents/485/tnormal.zip");
			ZipInputStream zip = new ZipInputStream(input);
			ZipEntry entry;
			String fileName;
			Scanner zipReader;
			
			// If we want to read the next file in zip using scanners, 
			// first we set entry = zip.getNextEntry();
			// then we say zipReader = new Scanner(zip);
			for (int i = 0; i < numOfFiles; i++) {
				entry = zip.getNextEntry();
				zipReader = new Scanner(zip);
				fileName = entry.getName();
				
				// fileName.substring(6,8) is the month number.
				// by the way I heard Canadians have difficulty answer questions like 
				// "which month of the year is September?" 
				// I don't know if that's true. Maybe that's the States. Canadians are smarter.
				if (fileName.substring(6,8).equals("01") || fileName.substring(6,8).equals("02") || 
						fileName.substring(6,8).equals("12")) 
				{
					// Winter: December, January, Febuary
					int stationCount = 0; // array iterator
					double tempWinterTemp = 0; // stands for "temporary winter temperature". Bad naming, I know. 
					// Not a necessary variable though; can be achieved solely by getters and setters.
					while(zipReader.hasNextLine()) {
						// start reading the TXT file line by line.
						inputLine = zipReader.nextLine();
						separatedLine = inputLine.split("\\s+");
					
						// separatedLine[5] is a string. Covert that to double.
						if (Double.parseDouble(separatedLine[5]) != -9999.9000) {
							// if we get in here, that means our "temp" value is not -9999.9000, but some valid value.
							
							// keep track of how many valid winter temp data we have. We don't want to count # of -9999.9000, 
							// so we have a getter and setter for winterValidDataCount.
							// equivalent of "winterValidData++", but... private variables, you know.
							stationList[stationCount].setWinterValidDataCount(stationList[stationCount].getWinterValidDataCount() + 1);
							
							// equivalent of "winterAvg+=separatedLine[5]" 
							tempWinterTemp = stationList[stationCount].getWinterAvg();
							tempWinterTemp += Double.parseDouble(separatedLine[5]);
							stationList[stationCount].setWinterAvg(tempWinterTemp);
						}
						// no matter the data is valid or not, we gotta increase array iterator and get ready for the next station.
						// that's why this increment is outside "if"
						stationCount++;
					}
					
				} 
				else if (fileName.substring(6,8).equals("03") || fileName.substring(6,8).equals("04") || 
						fileName.substring(6,8).equals("05")) 
				{
					// Spring. Basically the same thing.
					int stationCount = 0;
					double tempSpringTemp = 0;					
					
					while(zipReader.hasNextLine()) {
						inputLine = zipReader.nextLine();
						separatedLine = inputLine.split("\\s+");
						
						if (Double.parseDouble(separatedLine[5]) != -9999.9000) {
							stationList[stationCount].setSpringValidDataCount(stationList[stationCount].getSpringValidDataCount() + 1);
							tempSpringTemp = stationList[stationCount].getSpringAvg();
							tempSpringTemp += Double.parseDouble(separatedLine[5]);
							stationList[stationCount].setSpringAvg(tempSpringTemp);
						}
						stationCount++;
					}
				} 
				else if (fileName.substring(6,8).equals("06") || fileName.substring(6,8).equals("07") || 
						fileName.substring(6,8).equals("08")) 
				{
					// Summer. Same thing.
					int stationCount = 0;
					double tempSummerTemp = 0;
					while(zipReader.hasNextLine()) {
						inputLine = zipReader.nextLine();
						separatedLine = inputLine.split("\\s+");
						
						if (Double.parseDouble(separatedLine[5]) != -9999.9000) {
							stationList[stationCount].setSummerValidDataCount(stationList[stationCount].getSummerValidDataCount() + 1);
							tempSummerTemp = stationList[stationCount].getSummerAvg();
							tempSummerTemp += Double.parseDouble(separatedLine[5]);
							stationList[stationCount].setSummerAvg(tempSummerTemp);
						}
						stationCount++;
					}					
				} 
				else 
				{
					// Fall. No comments.
					int stationCount = 0;
					double tempFallTemp = 0;
					while(zipReader.hasNextLine()) {
						inputLine = zipReader.nextLine();
						separatedLine = inputLine.split("\\s+");
						
						if (Double.parseDouble(separatedLine[5]) != -9999.9000) {
							stationList[stationCount].setFallValidDataCount(stationList[stationCount].getFallValidDataCount() + 1);
							tempFallTemp = stationList[stationCount].getFallAvg();
							tempFallTemp += Double.parseDouble(separatedLine[5]);
							stationList[stationCount].setFallAvg(tempFallTemp);
						}
						stationCount++;
					}	
				}
			}
			
			
			// Alright, now that we have stored all the values in the appropriate season,
			// we gonna calculate the average value, because right now we have totally value in places like winterAvg.
			// Also, we're gonna use PrintWriter class to write values to appropriate txt files.
		
			
			PrintWriter springWriter = new PrintWriter("springAverage.txt", "UTF-8");
			PrintWriter summerWriter = new PrintWriter("summerAverage.txt", "UTF-8");
			PrintWriter fallWriter = new PrintWriter("fallAverage.txt", "UTF-8");
			PrintWriter winterWriter = new PrintWriter("winterAverage.txt", "UTF-8");
			PrintWriter annualWriter = new PrintWriter("annualAverage.txt", "UTF-8");

			// start the file with [ since it's an array.
			springWriter.print("[");
			summerWriter.print("[");
			fallWriter.print("[");
			winterWriter.print("[");
			annualWriter.print("[");

			
			// purely for debugging and statistical reason. Not being written into the files
			int numOfValidPoint = 0;
			
			for (int j = 0; j < totalStationNumber; j++) {
				// After processing all the 360 files, if any station still has 1 of spring/summer/fall/winter value as 0, that
				// station is treated as invalid station, and it's not going into the files.
				if ((stationList[j].getSpringAvg() != 0)
						&&
						(stationList[j].getSummerAvg() != 0)
						&&
						(stationList[j].getFallAvg() != 0)
						&&
						(stationList[j].getWinterAvg() != 0)) {
					
					// alright, this station has no 0 at any seasonal values.
					numOfValidPoint++;
					
					// calculate spring average temperature.
					stationList[j].setSpringAvg(stationList[j].getSpringAvg() / stationList[j].getSpringValidDataCount());
					// write that value into the text file.
					// It looks like this:
					// {"lat": 12.432, "lon": 18.33, "temp": -10.0}
					// use truncateDecimal function to round temperature to 3 decimal digits.
					springWriter.print("{\"lat\": " + stationList[j].getLat() + 
							", \"lon\": " + stationList[j].getLon() + 
							", \"temp\": " +  
							truncateDecimal(stationList[j].getSpringAvg(), 3) +
							"}, ");
					
					stationList[j].setSummerAvg(stationList[j].getSummerAvg() / stationList[j].getSummerValidDataCount());
					summerWriter.print("{\"lat\": " + stationList[j].getLat() + 
							", \"lon\": " + stationList[j].getLon() + 
							", \"temp\": " +  
							truncateDecimal(stationList[j].getSummerAvg(), 3) +
							"}, ");
					stationList[j].setFallAvg(stationList[j].getFallAvg() / stationList[j].getFallValidDataCount());
					fallWriter.print("{\"lat\": " + stationList[j].getLat() + 
							", \"lon\": " + stationList[j].getLon() + 
							", \"temp\": " +  
							truncateDecimal(stationList[j].getFallAvg(), 3) +
							"}, ");
					stationList[j].setWinterAvg(stationList[j].getWinterAvg() / stationList[j].getWinterValidDataCount());
					winterWriter.print("{\"lat\": " + stationList[j].getLat() + 
							", \"lon\": " + stationList[j].getLon() + 
							", \"temp\": " +  
							truncateDecimal(stationList[j].getWinterAvg(), 3) +
							"}, ");
					
					stationList[j].setAnnualAvg((stationList[j].getSpringAvg() + stationList[j].getSummerAvg()
							+ stationList[j].getFallAvg() + stationList[j].getWinterAvg()) / 4);
					annualWriter.print("{\"lat\": " + stationList[j].getLat() + 
							", \"lon\": " + stationList[j].getLon() + 
							", \"temp\": " +  
							truncateDecimal(stationList[j].getAnnualAvg(), 3) +
							"}, ");					
				}
			}
			// write "]" at the end of the file.
			// note that the file generated has "},]" as ending. Fix this manually.
			springWriter.print("]");
			summerWriter.print("]");
			fallWriter.print("]");
			winterWriter.print("]");
			annualWriter.print("]");

			// close all the PrintWriters.
			// Don't neglect this step; without this step, files might not be written properly.
			// Yeah I tried.
			springWriter.close();
			summerWriter.close();
			fallWriter.close();
			winterWriter.close();
			annualWriter.close();
			
			System.out.println("Valid Points: " + numOfValidPoint);
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
