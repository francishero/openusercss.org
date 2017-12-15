import gql from 'graphql-tag'
import {cloneDeep} from 'lodash'
import {ExpectedError} from '../../../../../../shared/custom-errors'
import {apolloClient} from '../../'

import {
  verifyToken as verifyTokenQuery,
  theme as themeQuery,
  user as userQuery,
  latestThemes as latestThemesQuery,
  search as searchQuery,
  verifyEmail as verifyEmailQuery
} from '../queries'

export const deleteTheme = async (id, token) => {
  const mutation = gql(`
    mutation {
      deleteTheme(id: "${id}", token: "${token}")
    }
  `)
  let success = null

  try {
    success = await apolloClient.mutate({
      mutation
    })
  } catch (error) {
    throw new ExpectedError({
      'message': error.message
    })
  }

  return success
}

export const verifyToken = async (token) => {
  let result = null

  try {
    result = await apolloClient.query({
      'query': verifyTokenQuery({token})
    })
  } catch (error) {
    result = {
      'data': {
        'verifyToken': false
      }
    }
  }

  return result
}

export const verifyEmail = async (token) => {
  let result = null

  try {
    result = await apolloClient.query({
      'query': verifyEmailQuery({token})
    })
  } catch (error) {
    result = {
      'data': {
        'verifyEmail': false
      }
    }
  }

  return result
}

export const getFullTheme = async (id) => {
  let theme = null

  try {
    theme = await apolloClient.query({
      'query': themeQuery({id})
    })
  } catch (error) {
    throw new ExpectedError({
      'message': error.message
    })
  }

  return theme
}

export const getFullUser = async (id) => {
  let user = null

  try {
    user = await apolloClient.query({
      'query': userQuery({id})
    })
  } catch (error) {
    throw new ExpectedError({
      'message': error.message
    })
  }

  return user
}

export const getLatestThemes = async (limit) => {
  let themes = null

  try {
    themes = await apolloClient.query({
      'query': latestThemesQuery({limit})
    })
  } catch (error) {
    throw new ExpectedError({
      'message': error.message
    })
  }

  return themes
}

export const search = async ({terms, limit, skip}) => {
  let results = null
  let data = null

  try {
    results = await apolloClient.query({
      'query': searchQuery({terms, limit, skip})
    })
    data = cloneDeep(results).data

    await data.search.themes.forEach(async (theme, index) => {
      data.search.themes[index] = (await getFullTheme(theme._id)).data.theme
    })
    await data.search.users.forEach(async (user, index) => {
      data.search.users[index] = (await getFullUser(user._id)).data.user
    })
  } catch (error) {
    throw new ExpectedError({
      'message': error.message
    })
  }

  if (!data) {
    return {
      'data': {
        'search': {
          'users':  [],
          'themes': []
        }
      }
    }
  }
  return {
    data
  }
}
