import {Slider} from '@miblanchard/react-native-slider';
import React, {useEffect, useState} from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Touchable,
  ActivityIndicator,
} from 'react-native';
import {NetworkInfo} from 'react-native-network-info';

function App() {
  const [isFound, setIsFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceIp, setDeviceIp] = useState(null);

  const urlPlay =
    '/httpapi.asp?command=setPlayerCmd:play:http://stream.radioreklama.bg/avtoradio.mp3';
  const urlPause = '/httpapi.asp?command=setPlayerCmd:stop';
  const deviceInfo = '/httpapi.asp?command=getStatusEx';
  const setVol = '/httpapi.asp?command=setPlayerCmd:vol:';

  function findDevice() {
    setIsLoading(true);
    NetworkInfo.getIPAddress().then(ipAddress => {
      let device = '';
      device = ipAddress.split('.');
      device.pop();
      const localIp =
        'http://' + device[0] + '.' + device[1] + '.' + device[2] + '.';

      for (let i = 0; i <= 255; i++) {
        setTimeout(() => {
          const probeIp = localIp + i;
          fetch(probeIp + deviceInfo)
            .then(res => {
              if (res.status == 200) {
                setIsFound(true);
                setIsLoading(false);
                setDeviceIp(probeIp);
              }
            })
            .catch(error => console.log(error));
        }, 1000);
      }
    });
  }

  function playAudio() {
    if (deviceIp) {
      fetch(deviceIp + urlPlay)
        .then(resp => resp)
        .catch(error => console.log(error));
    } else {
      console.log('no ip');
    }
  }

  function disconnectDevice() {
    if (deviceIp) {
      fetch(deviceIp + urlPause)
        .then(res => res)
        .catch(error => console.log(error));
    } else {
      console.log('no ip');
    }

    setIsFound(false);
    setIsLoading(false);
    setDeviceIp(null);
  }

  function stopAudio() {
    if (deviceIp) {
      fetch(deviceIp + urlPause)
        .then(res => res)
        .catch(error => console.log(error));
    } else {
      console.log('no ip');
    }
  }

  function handleChangeVolume(e) {
    const volLevel = Math.round(Number(e[0]));

    if (deviceIp) {
      fetch(deviceIp + setVol + volLevel)
        .then(resp => resp.status)
        .catch(error => console.log(error));
    } else {
      console.log('no ip');
    }
  }

  return (
    <View style={styles.screen}>
      {isFound ? <Text>Found device {deviceIp}</Text> : null}

      {isLoading ? (
        <ActivityIndicator size="large" color="#FFFFFF" animating={isLoading} />
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={isFound ? disconnectDevice : findDevice}>
          <Text style={styles.button_text}>
            {isFound ? 'Disconnect' : 'Fetch Device'}
          </Text>
        </TouchableOpacity>
      )}

      {isFound ? (
        <View>
          <TouchableOpacity
            style={[styles.button, !isFound && styles.button_inactive]}
            onPress={playAudio}
            disabled={!isFound}>
            <Text style={styles.button_text}>Play a song</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={stopAudio}
            style={[styles.button, !isFound && styles.button_inactive]}
            disabled={!isFound}>
            <Text style={styles.button_text}>Stop</Text>
          </TouchableOpacity>
          <Slider
            containerStyle={styles.slider_container}
            trackStyle={styles.slider_track}
            minimumValue={0}
            maximumValue={100}
            onSlidingComplete={handleChangeVolume}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button_text: {
    color: '#FFFFFF',
    fontSize: 30,
  },
  button: {
    backgroundColor: '#3D4550',
    width: 200,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    shadowOpacity: 0.8,
    shadowRadius: 3,
    shadowOffset: {width: 1, height: 3},
    marginBottom: 10,
  },
  button_inactive: {
    backgroundColor: '#222229',
  },
  screen: {
    backgroundColor: '#222933',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slider_track: {
    widh: 200,
    flex: 0,
    borderRadius: 10,
  },
  slider_container: {
    width: 200,
  },
});

export default App;
