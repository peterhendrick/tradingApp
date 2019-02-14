import { modalActions } from '../_constants';

const initialState = {
    modalType: null,
    modalProps: {}
}

export default (state = initialState, action) => {
    switch (action.type) {
        case modalActions.SHOW_MODAL:
            return {
                modalProps: action.modalProps,
                modalType: action.modalType,
                type: action.type
            }
        case modalActions.HIDE_MODAL:
            return initialState
        default:
            return state
    }
}