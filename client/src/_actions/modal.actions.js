import { modalActions } from '../_constants';

export const showModal = ({ modalProps, modalType }) => dispatch => {
    dispatch({
      type: modalActions.SHOW_MODAL,
      modalProps,
      modalType
    });
  }

  export const hideModal = () => dispatch => {
    dispatch({
      type: modalActions.HIDE_MODAL
    });
  }
