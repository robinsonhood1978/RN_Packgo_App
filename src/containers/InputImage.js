import * as React from 'react';
import {StyleSheet, View, Platform} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import Image from 'src/components/Image';
import ViewLabel from 'src/components/ViewLabel';
import Button from 'src/components/Button';
import Card from 'src/components/Card';
import ModalImage from './ModalImage';
import {updateImages} from '../services/media_service';
import {AuthContext} from 'src/utils/auth-context';
import {showMessage} from 'src/utils/message';

const options = {
  customButtons: [{name: 'media_library', title: 'Choose from media library'}],
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};

function InputImage(props) {
  const [isModal, setModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const {value, onChangeImage, contentStyle, typeGet, ...rest} = props;

  const {userToken} = React.useContext(AuthContext);

  const getImage = () => {
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        setModal(true);
        console.log('User tapped custom button: ', response.customButton);
      } else {
        if (onChangeImage) {
          setLoading(true);

          const data = new FormData();
          let mime = response.type || 'image/jpeg';
          data.append('file', {
            name:
              response.fileName ||
              `${Math.random().toString(36).substring(7)}.${
                mime.split('/')[1]
              }`,
            type: mime,
            uri:
              Platform.OS === 'android'
                ? response.uri
                : response.uri.replace('file://', ''),
          });
          updateImages(data, userToken)
            .then((dataApi) => {
              setLoading(false);
              onChangeImage(
                typeGet === 'object' ? dataApi : dataApi.source_url,
              );
              showMessage({
                message: 'Update photo',
                description: 'Update photo complete',
                type: 'success',
              });
            })
            .catch((error) => {
              setLoading(false);
              showMessage({
                message: 'Update photo',
                description: error.message,
                type: 'danger',
              });
            });
        }
      }
    });
  };

  return (
    <ViewLabel {...rest} type="solid" style={[styles.view, contentStyle]}>
      <View style={styles.content}>
        <Card secondary style={styles.imageCard}>
          {value ? (
            <Image source={{uri: value}} style={styles.image} />
          ) : (
            <View>
              <Image
                source={require('src/assets/images/default_image.png')}
                style={styles.imageEmpty}
              />
            </View>
          )}
        </Card>

        <Button
          title="Select Image"
          size="small"
          secondary
          buttonStyle={styles.button}
          onPress={getImage}
          loading={loading}
        />
      </View>
      <ModalImage
        visible={isModal}
        setModalVisible={(v) => setModal(v)}
        selectImage={value}
        onChange={(v) => onChangeImage(v)}
        typeGet={typeGet}
      />
    </ViewLabel>
  );
}

const styles = StyleSheet.create({
  view: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  image: {
    width: 80,
    height: 80,
  },
  imageCard: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageEmpty: {
    width: 40,
    height: 40,
  },
  button: {
    width: 157,
  },
});

export default InputImage;
