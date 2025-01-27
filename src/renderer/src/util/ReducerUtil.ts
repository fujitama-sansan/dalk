import React from 'react'

const composeReducers = <S, A>(...reducers: React.Reducer<S, A>[]): React.Reducer<S, A> => {
  return (prev, action) => {
    return reducers.reduce((acc, reducer) => reducer(acc, action), prev)
  }
}

export const ReducerUtil = {
  composeReducers
} as const
