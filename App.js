import React from 'react';
import {
  SafeAreaView,
  View
} from 'react-native';

import Picker from './Picker';

const values = new Array(100)
  .fill(0)
  .map((_, i) => {
    const value = i + 1;
    return { value, label: `${value}kgs` };
  });

const App = () => {
  const defaultValue = 27;

  const onChange = (value) => {
    console.log('ON_CHANGE ', value)
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Picker
          tintColor="#0495bd"
          itemHeight={70}
          labelStyle={{ fontSize: 40 }}
          {...{ values, defaultValue, onChange }}
        />
      </View>
    </SafeAreaView>
  );
};

export default App;
