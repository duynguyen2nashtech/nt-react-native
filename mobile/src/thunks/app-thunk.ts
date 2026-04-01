import { ThunkAction } from 'redux-thunk';
import { RootState } from '../store/rootReducer';

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, any>;

