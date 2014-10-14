package test.powercalc;

import static org.junit.Assert.*;
import main.powercalc.DataTuple;
import main.powercalc.HydroCalc;

import org.junit.Test;

public class HydroCalcTest {
	@Test
	public void testPowerCalc() {
		HydroCalc hydro = new HydroCalc();
		
		DataTuple[] result = hydro.powerCalc(1, 1, 2, 2, 0.5, -1);
		
		for(int i = 0; i < result.length; i++)
			assertEquals(4905.0,result[i].getCalcdata(),0.001);
	}
}
