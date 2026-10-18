import React from 'react'

import { render } from '@testing-library/react-native'

import { InputField } from './InputField'

describe('InputField', () => {
  it('renders label', () => {
    const { getByText } = render(<InputField value="" onChangeText={jest.fn()} label="Email" />)
    expect(getByText('Email')).toBeTruthy()
  })

  it('shows required asterisk when isRequired', () => {
    const { getByText } = render(
      <InputField value="" onChangeText={jest.fn()} label="Email" isRequired />
    )
    expect(getByText('*')).toBeTruthy()
  })

  it('does not show asterisk when not required', () => {
    const { queryByText } = render(<InputField value="" onChangeText={jest.fn()} label="Email" />)
    expect(queryByText('*')).toBeNull()
  })

  it('shows hint text', () => {
    const { getByText } = render(
      <InputField value="" onChangeText={jest.fn()} hint="We'll never share your email" />
    )
    expect(getByText("We'll never share your email")).toBeTruthy()
  })

  it('shows error message and hides hint when errorMessage is present', () => {
    const { getByText, queryByText } = render(
      <InputField
        value=""
        onChangeText={jest.fn()}
        hint="Enter a valid email"
        errorMessage="Email is required"
      />
    )
    expect(getByText('Email is required')).toBeTruthy()
    expect(queryByText('Enter a valid email')).toBeNull()
  })

  it('shows success message when no error', () => {
    const { getByText } = render(
      <InputField
        value="test@example.com"
        onChangeText={jest.fn()}
        successMessage="Email looks good!"
      />
    )
    expect(getByText('Email looks good!')).toBeTruthy()
  })

  it('error takes precedence over success message', () => {
    const { getByText, queryByText } = render(
      <InputField
        value=""
        onChangeText={jest.fn()}
        errorMessage="Invalid email"
        successMessage="Email looks good!"
      />
    )
    expect(getByText('Invalid email')).toBeTruthy()
    expect(queryByText('Email looks good!')).toBeNull()
  })

  it('passes error state to Input when errorMessage is set', () => {
    const { UNSAFE_getAllByType } = render(
      <InputField value="" onChangeText={jest.fn()} errorMessage="Required field" />
    )
    const { View } = require('react-native')
    const views = UNSAFE_getAllByType(View)
    const hasErrorBorder = views.some(
      (v) => typeof v.props.className === 'string' && v.props.className.includes('border-danger')
    )
    expect(hasErrorBorder).toBe(true)
  })

  it('disables input when isDisabled', () => {
    const { getByDisplayValue } = render(
      <InputField value="locked" onChangeText={jest.fn()} isDisabled />
    )
    expect(getByDisplayValue('locked').props.editable).toBe(false)
  })

  it('renders without label or hint', () => {
    const { getByDisplayValue } = render(<InputField value="hello" onChangeText={jest.fn()} />)
    expect(getByDisplayValue('hello')).toBeTruthy()
  })

  it('renders placeholder', () => {
    const { getByPlaceholderText } = render(
      <InputField value="" onChangeText={jest.fn()} placeholder="Your email" />
    )
    expect(getByPlaceholderText('Your email')).toBeTruthy()
  })
})
