import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import { store, RootState } from '../store/store';

export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
