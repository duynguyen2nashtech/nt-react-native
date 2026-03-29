import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../../stores/store';
import { fetchApiData, selectApiData, selectApiError, selectApiLoading } from '../../../slices/api-slice';


const useApiData = () => {
    const dispatch = useAppDispatch()
    const apiData = useAppSelector(selectApiData);
    const loading = useAppSelector(selectApiLoading);
    const error = useAppSelector(selectApiError);

    useEffect(() => {
        dispatch(fetchApiData())
    }, [dispatch]);

    return { apiData, loading, error };
};

export default useApiData;
