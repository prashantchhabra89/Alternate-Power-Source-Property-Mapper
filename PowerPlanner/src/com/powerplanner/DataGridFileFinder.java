package com.powerplanner;

import java.io.File;


public class DataGridFileFinder {
	File fileWind = new File("/Users/pchhabra/Documents/Git/Alternate-Power-Source-Property-Mapper/PowerPlanner/Database/Wind");
	File fileListWind[] = fileWind.listFiles();
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
			//System.out.println(latitude1);
			latitude2 = Double.parseDouble(name.charAt(8)+""+name.charAt(9)+".");
			//System.out.println(latitude2);
			longitude1 = Double.parseDouble(name.charAt(4)+""+name.charAt(5)+name.charAt(6)+".");
			//System.out.println(longitude1);
			longitude2 = Double.parseDouble(name.charAt(12)+""+name.charAt(13)+name.charAt(14)+".");
			//System.out.println(longitude2);
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
	public String [] solarFileFinder(String Season)
	{
		counterSolarfileFinder = 0;
		
		switch(Season)
		{
			case "Jan" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[0].getName();
			counterSolarfileFinder++;
			break;
			case "Feb" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[5].getName();
			counterSolarfileFinder++;
			break;
			case "Mar" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[6].getName();
			counterSolarfileFinder++;
			break;
			case "Apr" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[7].getName();
			counterSolarfileFinder++;
			break;
			case "May" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[8].getName();
			counterSolarfileFinder++;
			break;
			case "Jun" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[9].getName();
			counterSolarfileFinder++;
			break;
			case "Jul" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[10].getName();
			counterSolarfileFinder++;
			break;
			case "Aug" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[11].getName();
			counterSolarfileFinder++;
			break;
			case "Sep" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[12].getName();
			counterSolarfileFinder++;
			break;
			case "Oct" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[1].getName();
			counterSolarfileFinder++;
			break;
			case "Nov" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[2].getName();
			counterSolarfileFinder++;
			break;
			case "Dec" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[3].getName();
			counterSolarfileFinder++;
			break;
			case "Anu" : returnSolarFileListArray[counterSolarfileFinder] = fileListSolar[4].getName();
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
