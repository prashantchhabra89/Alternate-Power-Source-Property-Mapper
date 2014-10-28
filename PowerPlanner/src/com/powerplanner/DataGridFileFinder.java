package com.powerplanner;

import java.io.File;


public class DataGridFileFinder {
	File file = new File("/Users/pchhabra/Documents/Git/Alternate-Power-Source-Property-Mapper/PowerPlanner/Database/Wind");
	String arr[] = new String[file.listFiles().length];
	File fileList[] = file.listFiles();
	Double latitude1;
	Double latitude2;
	Double longitude1;
	Double longitude2;

	String returnFileListArray[] = new String[file.listFiles().length];
	int counter;
	int counter2;


	public String[] fileFinder(Double neLat, Double neLon, Double swLat, Double swLon)
	{
		counter=0;
		for(int i=0;i<file.listFiles().length;i++)
		{
			String name = fileList[i].getName();
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
					returnFileListArray[counter]=fileList[i].getPath();
					counter++;
				}
			}
			else
			{
				if((latitude1>=swLat&&latitude1<=neLat)||(latitude2>=swLat&&latitude2<=neLat))
				{
					if((longitude1<=swLon&&longitude1>=neLon)||(longitude2<=swLon&&longitude2>=neLon))
					{
						returnFileListArray[counter]=fileList[i].getPath();
						counter++;
					}
				}
			}

		}
		return returnFileListArray;
	}
	public void displayFileList()
	{
		counter2=0;
		while(returnFileListArray[counter2]!=null) 
		{
			System.out.println(returnFileListArray[counter2]);
			counter2++;
		}
	}
}
