import React, { useRef } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  withTiming,
  useAnimatedGestureHandler,
  runOnJS
} from "react-native-reanimated";
import { PanGestureHandler, TapGestureHandler } from "react-native-gesture-handler";
import { snapPoint } from "react-native-redash";

// interface GestureHandlerProps {
//   value: Animated.Value<number>;
//   max: number;
// }

const GestureHandler = ({ value, max, onChange, itemHeight }) => {
  const tapHandlerRef = useRef();
  const snapPoints = new Array(max).fill(0).map((_, i) => i * -itemHeight);

  const calculateValue = (newValue) => {
    'worklet';

    if (Math.abs(newValue) >= itemHeight * max) {
      return -(itemHeight * (max - 1));
    }

    if (newValue > 0) {
      return 0;
    }

    return newValue;
  };

  const fixValueStep = (value) => {
    'worklet';

    const sign = Math.sign(value);
    const absValue = Math.abs(value);

    return Math.ceil(absValue) * sign;
  };

  const getSelectedIndex = (value) => {
    'worklet';

    return Math.ceil(Math.abs(value / itemHeight));
  };

  const panGestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = value.value;
    },
    onActive: (event, ctx) => {
      value.value = ctx.startY + event.translationY;
    },
    onEnd: (evt) => {
      // const velocitySign = Math.sign(evt.velocityY);
      const newValue = snapPoint(
        value.value,
        /*Math.min(Math.abs(evt.velocityY), 200) * velocitySign*/
        evt.velocityY,
        snapPoints
      );
 
      value.value = withTiming(newValue);
      runOnJS(onChange)(getSelectedIndex(newValue));
    },
  });

  const tapGestureHandler = useAnimatedGestureHandler({
    onEnd: ({ y }) => {
      let newValue = value.value;

      if (y > 0 && y < itemHeight) {
        newValue = value.value + itemHeight * 2;
      }
      if (y > itemHeight && y < itemHeight * 2) {
        newValue = value.value + itemHeight;
      }
      if (y > itemHeight * 3 && y < itemHeight * 4) {
        newValue = value.value - itemHeight;
      }
      if (y > itemHeight * 4) {
        newValue = value.value - itemHeight * 2;
      }

      const calculatedValue = fixValueStep(calculateValue(newValue));

      value.value = withTiming(calculatedValue);

      runOnJS(onChange)(getSelectedIndex(calculatedValue));
    },
  });

  return (
    <TapGestureHandler ref={tapHandlerRef} onGestureEvent={tapGestureHandler}>
      <Animated.View style={StyleSheet.absoluteFill}>
        <PanGestureHandler onGestureEvent={panGestureHandler}>
          <Animated.View style={StyleSheet.absoluteFill} />
        </PanGestureHandler>
      </Animated.View>
    </TapGestureHandler>
  );
};

export default GestureHandler;