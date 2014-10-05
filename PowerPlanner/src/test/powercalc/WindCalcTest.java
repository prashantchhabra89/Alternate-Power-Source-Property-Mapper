package test.powercalc;

import static org.junit.Assert.*;
import main.powercalc.DataTuple;
import main.powercalc.WindCalc;

import org.junit.Test;

public class WindCalcTest {
	@Test
	public void testPowerCalc() {
		WindCalc wind = new WindCalc();
		
		DataTuple[] result = wind.powerCalc(1, 1, 2, 2, 0.5, 1, -1);
		
		for(int i = 0; i < result.length; i++)
			assertEquals(0.306,result[i].getData(),0.000001);
	}
}
