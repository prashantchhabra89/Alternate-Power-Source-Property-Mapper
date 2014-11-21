package main.powercalc;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DatabaseFileFinder {
	private String [] windFileFullArr_anu = new String[630];
	private String [] windFileFullArr_djf = new String[630];
	private String [] windFileFullArr_jja = new String[630];
	private String [] windFileFullArr_mam = new String[630];
	private String [] windFileFullArr_son = new String[630];
	private String [] solarFileFullArr = new String[5];
	private String [] hydroFileFullArr = new String[325];
	private Double latitude1;
	private Double latitude2;
	private Double longitude1;
	private Double longitude2;
	private String returnWindFileListArray[] = new String[3150];
	private String returnSolarFileListArray[] = new String[1];
	private String returnHydroFileListArray[] = new String[325];
	private int counterWindfileFinder;
	private String pathWind;
	private String pathSolar;
	private String pathHydro;
	
	/**
	 * 
	 */
	public DatabaseFileFinder() 
	{
		pathWind = "WEB-INF/Database/Wind/";
		pathSolar = "WEB-INF/Database/Solar/";
		pathHydro = "WEB-INF/Database/Hydro/";
		for(int i = 0; i < 21; i++) {
			for(int j = 0; j < 30; j++) {
				windFileFullArr_anu[i*30 + j] = String.valueOf(43+i) + "_" + String.valueOf(-135+j)
						+ "_" + String.valueOf(42+i) + "_" + String.valueOf(-136+j) + "_anu.json";
				windFileFullArr_djf[i*30 + j] = String.valueOf(43+i) + "_" + String.valueOf(-135+j)
						+ "_" + String.valueOf(42+i) + "_" + String.valueOf(-136+j) + "_djf.json";
				windFileFullArr_jja[i*30 + j] = String.valueOf(43+i) + "_" + String.valueOf(-135+j)
						+ "_" + String.valueOf(42+i) + "_" + String.valueOf(-136+j) + "_jja.json";
				windFileFullArr_mam[i*30 + j] = String.valueOf(43+i) + "_" + String.valueOf(-135+j)
						+ "_" + String.valueOf(42+i) + "_" + String.valueOf(-136+j) + "_mam.json";
				windFileFullArr_son[i*30 + j] = String.valueOf(43+i) + "_" + String.valueOf(-135+j)
						+ "_" + String.valueOf(42+i) + "_" + String.valueOf(-136+j) + "_son.json";
			}
		}
		
		solarFileFullArr[0] = "Solar_anu.json";
		solarFileFullArr[1] = "Solar_djf.json";
		solarFileFullArr[2] = "Solar_mam.json";
		solarFileFullArr[3] = "Solar_jja.json";
		solarFileFullArr[4] = "Solar_son.json";
	    
	    for (int i = 0; i < 13; i++) {
	    	for (int j = 0; j < 25; j++) {
	    		hydroFileFullArr[i*25 + j] = "Stream_" + String.valueOf(49+i) + "_" + String.valueOf(-138+j)
						+ "_" + String.valueOf(48+i) + "_" + String.valueOf(-139+j) + ".json";
	    	}
	    }
	}
	
	/**
	 * 
	 * @param neLat
	 * @param neLon
	 * @param swLat
	 * @param swLon
	 * @param season supplied season name should be anu,djf,jja,son,mam
	 * @return
	 */
	public String[] windFileFinder(Double neLat, Double neLon, Double swLat, Double swLon, String season)
	{
		counterWindfileFinder = 0;
		String [] handler = null;
		switch(season) {
		case "anu": handler = windFileFullArr_anu; break;
		case "djf": handler = windFileFullArr_djf; break;
		case "jja": handler = windFileFullArr_jja; break;
		case "mam": handler = windFileFullArr_mam; break;
		case "son": handler = windFileFullArr_son; break;
		default: return null;
		}
		for(String item : handler)
		{
			Pattern boundaryP = Pattern.compile("^([-]?\\d+)_([-]?\\d+)_([-]?\\d+)_([-]?\\d+)_.*$");
			Matcher boundaryM = boundaryP.matcher(item);
			if (!boundaryM.matches()) {
				continue;
			} else {
				latitude1 = Double.parseDouble(boundaryM.group(1));
				latitude2 = Double.parseDouble(boundaryM.group(3));
				longitude1 = Double.parseDouble(boundaryM.group(2));
				longitude2 = Double.parseDouble(boundaryM.group(4));
			}
			//if one of the corner of requested grid falls inside our database grid
			if(((neLat>=latitude2&&neLat<=latitude1)||(swLat>=latitude2&&swLat<=latitude1))
					&& ((neLon<=longitude1&&neLon>=longitude2)||(swLon<=longitude1&&swLon>=longitude2)))
			{
				returnWindFileListArray[counterWindfileFinder]=pathWind+item;
				counterWindfileFinder++;
			}
			//if one of the corner of our database grid falls inside requested grid
			else if (((latitude1>=swLat&&latitude1<=neLat)||(latitude2>=swLat&&latitude2<=neLat))
					&& ((longitude1>=swLon&&longitude1<=neLon)||(longitude2>=swLon&&longitude2<=neLon)))
			{
				returnWindFileListArray[counterWindfileFinder]=pathWind+item;
				counterWindfileFinder++;
			}
			//if there is overlap of the database and requested grid, but no corners fall in the other
			else if (((latitude2<swLat && latitude1>neLat)&&(longitude2>swLon && longitude1<neLon))
					|| ((longitude2<swLon && longitude1>neLon)&&(latitude2>swLat && latitude1<neLat))) 
			{
				returnWindFileListArray[counterWindfileFinder]=pathWind+item;
				counterWindfileFinder++;
			}
			
		}
		return returnWindFileListArray;
	}
	
	/**
	 * 
	 */
	public void displayWindReturnarr()
	{
		for(int counter = 0; returnWindFileListArray[counter]!=null; counter++)
		{
			System.out.println(returnWindFileListArray[counter]);
		}
	}

	/**
	 * 
	 * @param Season
	 * @return
	 */
	public String [] solarFileFinder(String Season)
	{	
		switch(Season)
		{	
			case "anu" : returnSolarFileListArray[0] = pathSolar+solarFileFullArr[0];	break;
			case "djf" : returnSolarFileListArray[0] = pathSolar+solarFileFullArr[1];	break;
			case "mam" : returnSolarFileListArray[0] = pathSolar+solarFileFullArr[2];	break;
			case "jja" : returnSolarFileListArray[0] = pathSolar+solarFileFullArr[3];	break;
			case "son" : returnSolarFileListArray[0] = pathSolar+solarFileFullArr[4]; break;
		}
		return returnSolarFileListArray;
	}
	
	/**
	 * 
	 */
	public void displaySolarFileList()
	{
		System.out.println(returnSolarFileListArray[0]);
	}
	
	/**
	 * 
	 * @param neLat
	 * @param neLon
	 * @param swLat
	 * @param swLon
	 * @param Season
	 * @return
	 */
	public String [] hydroFileFinder(Double neLat, Double neLon, Double swLat, Double swLon, String Season)
	{
		int counterHydrofileFinder = 0;
		for(String item : hydroFileFullArr)
		{
			Pattern boundaryP = Pattern.compile("^(\\w)+_([-]?\\d+)_([-]?\\d+)_([-]?\\d+)_([-]?\\d+).*$");
			Matcher boundaryM = boundaryP.matcher(item);
			if (!boundaryM.matches()) {
				continue;
			} else {
				latitude1 = Double.parseDouble(boundaryM.group(2));
				latitude2 = Double.parseDouble(boundaryM.group(4));
				longitude1 = Double.parseDouble(boundaryM.group(3));
				longitude2 = Double.parseDouble(boundaryM.group(5));
			}
			//if one of the corner of requested grid falls inside our database grid
			if(((neLat>=latitude2&&neLat<=latitude1)||(swLat>=latitude2&&swLat<=latitude1))
					&& ((neLon<=longitude1&&neLon>=longitude2)||(swLon<=longitude1&&swLon>=longitude2)))
			{
				returnHydroFileListArray[counterHydrofileFinder]=pathHydro+item;
				counterHydrofileFinder++;
			}
			//if one of the corner of our database grid falls inside requested grid
			else if (((latitude1>=swLat&&latitude1<=neLat)||(latitude2>=swLat&&latitude2<=neLat))
					&& ((longitude1>=swLon&&longitude1<=neLon)||(longitude2>=swLon&&longitude2<=neLon)))
			{
				returnHydroFileListArray[counterHydrofileFinder]=pathHydro+item;
				counterHydrofileFinder++;
			}
			//if there is overlap of the database and requested grid, but no corners fall in the other
			else if (((latitude2<swLat && latitude1>neLat)&&(longitude2>swLon && longitude1<neLon))
					|| ((longitude2<swLon && longitude1>neLon)&&(latitude2>swLat && latitude1<neLat))) 
			{
				returnHydroFileListArray[counterHydrofileFinder]=pathHydro+item;
				counterHydrofileFinder++;
			}	
		}
		return returnHydroFileListArray;
	}
	
	/**
	 * 
	 */
	public void displayHydroFileList()
	{
		for(int counter = 0; counter < returnHydroFileListArray.length 
				&& returnHydroFileListArray[counter] != null; counter++)
		{
			System.out.println(returnHydroFileListArray[counter]);
		}
	}
}
