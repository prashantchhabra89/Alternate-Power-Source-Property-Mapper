package com.powerplanner;

import java.io.File;


public class DataGridFileFinder {
	//path for wind data
	File fileWind = new File("/Users/pchhabra/Documents/Git/Alternate-Power-Source-Property-Mapper/PowerPlanner/Database/Wind");
	File fileListWind[] = fileWind.listFiles();
	//path for solar data
	File fileSolar = new File("/Users/pchhabra/Documents/Git/Alternate-Power-Source-Property-Mapper/PowerPlanner/Database/Solar");
	File fileListSolar[] = fileSolar.listFiles();
	Double latitude1;
	Double latitude2;
	Double longitude1;
	Double longitude2;

	String returnWindFileListArray[] = new String[fileWind.listFiles().length];
	String returnSolarFileListArray[] = new String[fileSolar.listFiles().length];
	int counterWindfileFinder;
	int counterSolarfileFinder;
	int counterDisplayWindFileList;
	int counterDisplaySolarFileList;

    //supplied season name should be anu,djf,jja,son,mam
	public String[] windFileFinder(Double neLat, Double neLon, Double swLat, Double swLon, String season)
	{
		counterWindfileFinder=0;
		for(int i=0;i<fileWind.listFiles().length;i++)
		{
			String name = fileListWind[i].getName();
			if(!(name.contains(season)))
					{
				continue;
					}
			latitude1 = Double.parseDouble(name.charAt(0)+""+name.charAt(1)+".");
			latitude2 = Double.parseDouble(name.charAt(8)+""+name.charAt(9)+".");
			longitude1 = Double.parseDouble(name.charAt(4)+""+name.charAt(5)+name.charAt(6)+".");
			longitude2 = Double.parseDouble(name.charAt(12)+""+name.charAt(13)+name.charAt(14)+".");
			//if one of the corner of requested grid falls inside our database grid
			if((neLat>=latitude2&&neLat<=latitude1)||(swLat>=latitude2&&swLat<=latitude1))
			{
				if((neLon>=longitude1&&neLon<=longitude2)||(swLon>=longitude1&&swLon<=longitude2))
				{
					returnWindFileListArray[counterWindfileFinder]=fileListWind[i].getPath();
					counterWindfileFinder++;
				}
			}
			else
			{
				//if one of the corner of our database grid falls inside requested grid
				if((latitude1>=swLat&&latitude1<=neLat)||(latitude2>=swLat&&latitude2<=neLat))
				{
					if((longitude1<=swLon&&longitude1>=neLon)||(longitude2<=swLon&&longitude2>=neLon))
					{
						returnWindFileListArray[counterWindfileFinder]=fileListWind[i].getPath();
						counterWindfileFinder++;
					}
				}
			}

		}
		return returnWindFileListArray;
	}
	public void displayWindFileList()
	{
		counterDisplayWindFileList=0;
		while(returnWindFileListArray[counterDisplayWindFileList]!=null) 
		{
			System.out.println(returnWindFileListArray[counterDisplayWindFileList]);
			counterDisplayWindFileList++;
		}
	}
	//season name should be Jan, Feb ,etc..
	//I think we will later on try to squash solar data into spring, fall, winter, etc
	public String [] solarFileFinder(String Season)
	{
		counterSolarfileFinder = 0;
		
		switch(Season)
		{
			case "Jan" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[0].getPath();
			counterSolarfileFinder++;
			break;
			case "Feb" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[5].getPath();
			counterSolarfileFinder++;
			break;
			case "Mar" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[6].getPath();
			counterSolarfileFinder++;
			break;
			case "Apr" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[7].getPath();
			counterSolarfileFinder++;
			break;
			case "May" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[8].getPath();
			counterSolarfileFinder++;
			break;
			case "Jun" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[9].getPath();
			counterSolarfileFinder++;
			break;
			case "Jul" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[10].getPath();
			counterSolarfileFinder++;
			break;
			case "Aug" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[11].getPath();
			counterSolarfileFinder++;
			break;
			case "Sep" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[12].getPath();
			counterSolarfileFinder++;
			break;
			case "Oct" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[1].getPath();
			counterSolarfileFinder++;
			break;
			case "Nov" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[2].getPath();
			counterSolarfileFinder++;
			break;
			case "Dec" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[3].getPath();
			counterSolarfileFinder++;
			break;
			case "Anu" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[4].getPath();
			counterSolarfileFinder++;
			break;	
		}
		return returnSolarFileListArray;
	}
	public void displaySolarFileList()
	{
		counterDisplaySolarFileList=0;
		while(returnWindFileListArray[counterDisplaySolarFileList]!=null) 
		{
			System.out.println(returnSolarFileListArray[counterDisplaySolarFileList]);
			counterDisplaySolarFileList++;
		}
	}
}
