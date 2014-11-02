package com.powerplanner;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DatabaseFileFInder {
	String [] windFileFullArr = new String[100];
	String [] SolardFileFullArr = new String[13];
	Double latitude1;
	Double latitude2;
	Double longitude1;
	Double longitude2;
	String returnWindFileListArray[] = new String[100];
	String returnSolarFileListArray[] = new String[13];
	int counterWindfileFinder;
	int counterSolarfileFinder;
	String pathWind;
	String pathSolar;
	
	public DatabaseFileFInder() 
	{
		pathWind = "WEB-INF/Database/Wind/";
		pathSolar = "WEB-INF/Database/Solar/";
		windFileFullArr[0] = "48_-106_42_-112_anu.json";
		windFileFullArr[1] = "48_-106_42_-112_djf.json";
		windFileFullArr[2] = "48_-106_42_-112_jja.json";
		windFileFullArr[3] = "48_-106_42_-112_mam.json";
		windFileFullArr[4] = "48_-106_42_-112_son.json";
		windFileFullArr[5] = "48_-112_42_-118_anu.json";
		windFileFullArr[6] = "48_-112_42_-118_djf.json";
		windFileFullArr[7] = "48_-112_42_-118_jja.json";
		windFileFullArr[8] = "48_-112_42_-118_mam.json";
		windFileFullArr[9] = "48_-112_42_-118_son.json";
		windFileFullArr[10] = "48_-118_42_-124_anu.json";
		windFileFullArr[11] = "48_-118_42_-124_djf.json";
		windFileFullArr[12] = "48_-118_42_-124_jja.json";
		windFileFullArr[13] = "48_-118_42_-124_mam.json";
		windFileFullArr[14] = "48_-118_42_-124_son.json";
		windFileFullArr[15] = "48_-124_42_-130_anu.json";
		windFileFullArr[16] = "48_-124_42_-130_djf.json";
		windFileFullArr[17] = "48_-124_42_-130_jja.json";
		windFileFullArr[18] = "48_-124_42_-130_mam.json";
		windFileFullArr[19] = "48_-124_42_-130_son.json";
		windFileFullArr[20] = "48_-130_42_-136_anu.json";
		windFileFullArr[21] = "48_-130_42_-136_djf.json";
		windFileFullArr[22] = "48_-130_42_-136_jja.json";
		windFileFullArr[23] = "48_-130_42_-136_mam.json";
		windFileFullArr[24] = "48_-130_42_-136_son.json";
		windFileFullArr[25] = "53_-106_48_-112_anu.json";
		windFileFullArr[26] = "53_-106_48_-112_djf.json";
		windFileFullArr[27] = "53_-106_48_-112_jja.json";
		windFileFullArr[28] = "53_-106_48_-112_mam.json";
		windFileFullArr[29] = "53_-106_48_-112_son.json";
		windFileFullArr[30] = "53_-112_48_-118_anu.json";
		windFileFullArr[31] = "53_-112_48_-118_djf.json";
		windFileFullArr[32] = "53_-112_48_-118_jja.json";
		windFileFullArr[33] = "53_-112_48_-118_mam.json";
		windFileFullArr[34] = "53_-112_48_-118_son.json";
		windFileFullArr[35] = "53_-118_48_-124_anu.json";
		windFileFullArr[36] = "53_-118_48_-124_djf.json";
		windFileFullArr[37] = "53_-118_48_-124_jja.json";
		windFileFullArr[38] = "53_-118_48_-124_mam.json";
		windFileFullArr[39] = "53_-118_48_-124_son.json";
		windFileFullArr[40] = "53_-124_48_-130_anu.json";
		windFileFullArr[41] = "53_-124_48_-130_djf.json";
		windFileFullArr[42] = "53_-124_48_-130_jja.json";
		windFileFullArr[43] = "53_-124_48_-130_mam.json";
		windFileFullArr[44] = "53_-124_48_-130_son.json";
		windFileFullArr[45] = "53_-130_48_-136_anu.json";
		windFileFullArr[46] = "53_-130_48_-136_djf.json";
		windFileFullArr[47] = "53_-130_48_-136_jja.json";
		windFileFullArr[48] = "53_-130_48_-136_mam.json";
		windFileFullArr[49] = "53_-130_48_-136_son.json";
		windFileFullArr[50] = "58_-106_53_-112_anu.json";
		windFileFullArr[51] = "58_-106_53_-112_djf.json";
		windFileFullArr[52] = "58_-106_53_-112_jja.json";
		windFileFullArr[53] = "58_-106_53_-112_mam.json";
		windFileFullArr[54] = "58_-106_53_-112_son.json";
		windFileFullArr[55] = "58_-112_53_-118_anu.json";
		windFileFullArr[56] = "58_-112_53_-118_djf.json";
		windFileFullArr[57] = "58_-112_53_-118_jja.json";
		windFileFullArr[58] = "58_-112_53_-118_mam.json";
		windFileFullArr[59] = "58_-112_53_-118_son.json";
		windFileFullArr[60] = "58_-118_53_-124_anu.json";
		windFileFullArr[61] = "58_-118_53_-124_djf.json";
		windFileFullArr[62] = "58_-118_53_-124_jja.json";
		windFileFullArr[63] = "58_-118_53_-124_mam.json";
		windFileFullArr[64] = "58_-118_53_-124_son.json";
		windFileFullArr[65] = "58_-124_53_-130_anu.json";
		windFileFullArr[66] = "58_-124_53_-130_djf.json";
		windFileFullArr[67] = "58_-124_53_-130_jja.json";
		windFileFullArr[68] = "58_-124_53_-130_mam.json";
		windFileFullArr[69] = "58_-124_53_-130_son.json";
		windFileFullArr[70] = "58_-130_53_-136_anu.json";
		windFileFullArr[71] = "58_-130_53_-136_djf.json";
		windFileFullArr[72] = "58_-130_53_-136_jja.json";
		windFileFullArr[73] = "58_-130_53_-136_mam.json";
		windFileFullArr[74] = "58_-130_53_-136_son.json";
		windFileFullArr[75] = "63_-106_58_-112_anu.json";
		windFileFullArr[76] = "63_-106_58_-112_djf.json";
		windFileFullArr[77] = "63_-106_58_-112_jja.json";
		windFileFullArr[78] = "63_-106_58_-112_mam.json";
		windFileFullArr[79] = "63_-106_58_-112_son.json";
		windFileFullArr[80] = "63_-112_58_-118_anu.json";
		windFileFullArr[81] = "63_-112_58_-118_djf.json";
		windFileFullArr[82] = "63_-112_58_-118_jja.json";
		windFileFullArr[83] = "63_-112_58_-118_mam.json";
		windFileFullArr[84] = "63_-112_58_-118_son.json";
		windFileFullArr[85] = "63_-118_58_-124_anu.json";
		windFileFullArr[86] = "63_-118_58_-124_djf.json";
		windFileFullArr[87] = "63_-118_58_-124_jja.json";
		windFileFullArr[88] = "63_-118_58_-124_mam.json";
		windFileFullArr[89] = "63_-118_58_-124_son.json";
		windFileFullArr[90] = "63_-124_58_-130_anu.json";
		windFileFullArr[91] = "63_-124_58_-130_djf.json";
		windFileFullArr[92] = "63_-124_58_-130_jja.json";
		windFileFullArr[93] = "63_-124_58_-130_mam.json";
		windFileFullArr[94] = "63_-124_58_-130_son.json";
		windFileFullArr[95] = "63_-130_58_-136_anu.json";
		windFileFullArr[96] = "63_-130_58_-136_djf.json";
		windFileFullArr[97] = "63_-130_58_-136_jja.json";
		windFileFullArr[98] = "63_-130_58_-136_mam.json";
		windFileFullArr[99] = "63_-130_58_-136_son.json";
		
		SolardFileFullArr[0] = "Solar_1.json";
		SolardFileFullArr[1] = "Solar_2.json";
		SolardFileFullArr[2] = "Solar_3.json";
		SolardFileFullArr[3] = "Solar_4.json";
		SolardFileFullArr[4] = "Solar_5.json";
		SolardFileFullArr[5] = "Solar_6.json";
		SolardFileFullArr[6] = "Solar_7.json";
		SolardFileFullArr[7] = "Solar_8.json";
		SolardFileFullArr[8] = "Solar_9.json";
		SolardFileFullArr[9] = "Solar_10.json";
		SolardFileFullArr[10] = "Solar_11.json";
		SolardFileFullArr[11] = "Solar_12.json";
	    SolardFileFullArr[12] = "Solar_13.json";
	}
	
    //supplied season name should be anu,djf,jja,son,mam
	public String[] windFileFinder(Double neLat, Double neLon, Double swLat, Double swLon, String season)
	{
		counterWindfileFinder = 0;
		for(String item : windFileFullArr)
		{
			if(!(item.contains(season)))
			{
		continue;
			}
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
			if((neLat>=latitude2&&neLat<=latitude1)||(swLat>=latitude2&&swLat<=latitude1))
			{
				if((neLon<=longitude1&&neLon>=longitude2)||(swLon<=longitude1&&swLon>=longitude2))
				{
					returnWindFileListArray[counterWindfileFinder]=pathWind+item;
					counterWindfileFinder++;
				}
			}
			else
			{
				//if one of the corner of our database grid falls inside requested grid
				if((latitude1>=swLat&&latitude1<=neLat)||(latitude2>=swLat&&latitude2<=neLat))
				{
					if((longitude1>=swLon&&longitude1<=neLon)||(longitude2>=swLon&&longitude2<=neLon))
					{
						returnWindFileListArray[counterWindfileFinder]=pathWind+item;;
						counterWindfileFinder++;
					}
				}
			}
		}
		return returnWindFileListArray;
	}
	public void displayWindReturnarr()
	{
	
		for(int counter = 0; returnWindFileListArray[counter]!=null; counter++)
		{
			System.out.println(returnWindFileListArray[counter]);
		}
	}
	//season name should be Jan, Feb ,etc..
		//I think we will later on try to squash solar data into spring, fall, winter, etc
		public String [] solarFileFinder(String Season)
		{
			counterSolarfileFinder = 0;
			
			switch(Season)
			{
				case "Jan" : returnSolarFileListArray[counterSolarfileFinder] = pathSolar+SolardFileFullArr[0];
				counterSolarfileFinder++;
				break;
				case "Feb" : returnSolarFileListArray[counterSolarfileFinder] = pathSolar+SolardFileFullArr[1];
				counterSolarfileFinder++;
				break;
				case "Mar" : returnSolarFileListArray[counterSolarfileFinder] = pathSolar+SolardFileFullArr[2];
				counterSolarfileFinder++;
				break;
				case "Apr" : returnSolarFileListArray[counterSolarfileFinder] = pathSolar+SolardFileFullArr[3];
				counterSolarfileFinder++;
				break;
				case "May" : returnSolarFileListArray[counterSolarfileFinder] = pathSolar+SolardFileFullArr[4];
				counterSolarfileFinder++;
				break;
				case "Jun" : returnSolarFileListArray[counterSolarfileFinder] = pathSolar+SolardFileFullArr[5];
				counterSolarfileFinder++;
				break;
				case "Jul" : returnSolarFileListArray[counterSolarfileFinder] = pathSolar+SolardFileFullArr[6];
				counterSolarfileFinder++;
				break;
				case "Aug" : returnSolarFileListArray[counterSolarfileFinder] = pathSolar+SolardFileFullArr[7];
				counterSolarfileFinder++;
				break;
				case "Sep" : returnSolarFileListArray[counterSolarfileFinder] = pathSolar+SolardFileFullArr[8];
				counterSolarfileFinder++;
				break;
				case "Oct" : returnSolarFileListArray[counterSolarfileFinder] = pathSolar+SolardFileFullArr[9];
				counterSolarfileFinder++;
				break;
				case "Nov" : returnSolarFileListArray[counterSolarfileFinder] = pathSolar+SolardFileFullArr[10];
				counterSolarfileFinder++;
				break;
				case "Dec" : returnSolarFileListArray[counterSolarfileFinder] = pathSolar+SolardFileFullArr[11];
				counterSolarfileFinder++;
				break;
				case "anu" : returnSolarFileListArray[counterSolarfileFinder] = pathSolar+SolardFileFullArr[12];
				counterSolarfileFinder++;
				break;	
			}
			return returnSolarFileListArray;
		}
		public void displaySolarFileList()
		{
			for(int counter = 0; returnSolarFileListArray[counter]!=null; counter++)
			{
				System.out.println(returnSolarFileListArray[counter]);
			}
		}

}
