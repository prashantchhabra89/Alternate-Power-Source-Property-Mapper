package test.powercalc;

import static org.junit.Assert.*;
import main.powercalc.DataTuple;
import main.powercalc.SolarCalc;

import org.junit.Test;

public class SolarCalcTest {
	@Test
	public void testPowerCalc() {
		SolarCalc solar = new SolarCalc();
		
		DataTuple[] result = solar.powerCalc(1, 1, 2, 2, 0.5, 1, 0.75, -1);
		
		for(int i = 0; i < result.length; i++)
			assertEquals(0.375,result[i].getData(),0.000001);
	}
}
