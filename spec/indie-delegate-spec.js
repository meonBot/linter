/* @flow */

import IndieDelegate from '../dist/indie-delegate'
import { getMessage } from './common'

describe('IndieDelegate', function () {
  let indieDelegate

  beforeEach(function () {
    indieDelegate = new IndieDelegate(
      {
        name: 'Indie',
      },
      2,
    )
  })
  afterEach(function () {
    indieDelegate.dispose()
  })

  it('has the basic linter properties', function () {
    expect(typeof indieDelegate.name).toBe('string')
    expect(indieDelegate.name).toBe('Indie')
    expect(typeof indieDelegate.scope).toBe('string')
    expect(indieDelegate.scope).toBe('project')
  })
  describe('::setMessages && ::getMessages && ::clearMessages', function () {
    it('works as expected', function () {
      const message = getMessage(false)
      expect(indieDelegate.getMessages()).toEqual([])
      indieDelegate.setMessages(message.location.file, [message])
      expect(indieDelegate.getMessages()).toEqual([message])
      indieDelegate.clearMessages()
      expect(indieDelegate.getMessages()).toEqual([])
    })
  })
  describe('::setMessages', function () {
    it('overwrites previous messages for that file', function () {
      const messageA = getMessage(false)
      const messageB = getMessage(false)
      const messageC = getMessage(false)
      expect(indieDelegate.getMessages()).toEqual([])
      indieDelegate.setMessages(messageA.location.file, [messageA, messageB])
      expect(indieDelegate.getMessages()).toEqual([messageA, messageB])
      indieDelegate.setMessages(messageA.location.file, [messageA, messageC])
      expect(indieDelegate.getMessages()).toEqual([messageA, messageC])
      indieDelegate.setMessages(messageA.location.file, [messageB, messageC])
      expect(indieDelegate.getMessages()).toEqual([messageB, messageC])
      indieDelegate.setMessages(messageA.location.file, [messageC])
      expect(indieDelegate.getMessages()).toEqual([messageC])
      indieDelegate.setMessages(messageA.location.file, [])
      expect(indieDelegate.getMessages()).toEqual([])
    })
    it('does not update if is disposed', function () {
      let timesUpdated = 0
      indieDelegate.onDidUpdate(function () {
        timesUpdated++
      })
      expect(timesUpdated).toBe(0)
      indieDelegate.setMessages(__filename, [getMessage(__filename)])
      expect(timesUpdated).toBe(1)
      indieDelegate.dispose()
      indieDelegate.setMessages(__filename, [getMessage(__filename)])
      expect(timesUpdated).toBe(1)
    })
    it('does update if not disposed', function () {
      let timesUpdated = 0
      indieDelegate.onDidUpdate(function () {
        timesUpdated++
      })
      expect(timesUpdated).toBe(0)
      indieDelegate.setMessages(__filename, [getMessage(__filename)])
      expect(timesUpdated).toBe(1)
      indieDelegate.setMessages(__filename, [getMessage(__filename)])
      expect(timesUpdated).toBe(2)
    })
    it('cries if message has a different filePath', function () {
      expect(function () {
        indieDelegate.setMessages(__filename, [getMessage(__filename)])
      }).not.toThrow()
      expect(function () {
        indieDelegate.setMessages(__filename, [getMessage(__filename), getMessage(__filename), getMessage(__filename)])
      }).not.toThrow()
      expect(function () {
        indieDelegate.setMessages(__filename, [getMessage(false)])
      }).toThrow('message.location.file does not match the given filePath')
      expect(function () {
        indieDelegate.setMessages(__filename, [getMessage(__filename), getMessage(false)])
      }).toThrow('message.location.file does not match the given filePath')
      expect(function () {
        indieDelegate.setMessages(__filename, [getMessage(__filename), getMessage(false), getMessage(__filename)])
      }).toThrow('message.location.file does not match the given filePath')
      expect(function () {
        indieDelegate.setMessages(__filename, [getMessage(__filename), getMessage(__filename), getMessage(false)])
      }).toThrow('message.location.file does not match the given filePath')
    })
    it('does not add invalid messages', function () {
      expect(indieDelegate.getMessages().length).toBe(0)
      expect(atom.notifications.getNotifications().length).toBe(0)
      indieDelegate.setMessages(__filename, [{}])
      expect(indieDelegate.getMessages().length).toBe(0)
      expect(atom.notifications.getNotifications().length).toBe(1)
      indieDelegate.setMessages(__filename, [getMessage(__filename)])
      expect(indieDelegate.getMessages().length).toBe(1)
      expect(atom.notifications.getNotifications().length).toBe(1)
    })
  })
  describe('::clearMessages', function () {
    it('does not update if disposed', function () {
      let timesUpdated = 0
      indieDelegate.onDidUpdate(function () {
        timesUpdated++
      })
      expect(timesUpdated).toBe(0)
      indieDelegate.setMessages(__filename, [getMessage(__filename)])
      expect(timesUpdated).toBe(1)
      indieDelegate.dispose()
      indieDelegate.clearMessages()
      expect(timesUpdated).toBe(1)
    })
    it('does update if not disposed', function () {
      let timesUpdated = 0
      indieDelegate.onDidUpdate(function () {
        timesUpdated++
      })
      expect(timesUpdated).toBe(0)
      indieDelegate.setMessages(__filename, [getMessage(__filename)])
      expect(timesUpdated).toBe(1)
      indieDelegate.clearMessages()
      expect(timesUpdated).toBe(2)
    })
  })
  describe('::setAllMessages', function () {
    it('automatically splits messages into filePath groups', function () {
      const messageA = getMessage(false)
      const messageB = getMessage(false)
      const messageC = getMessage(false)
      const messageD = getMessage(false)

      messageC.location.file = __filename
      messageD.location.file = __filename
      expect(indieDelegate.messages.size).toBe(0)
      indieDelegate.setAllMessages([messageA, messageB, messageC, messageD])
      expect(indieDelegate.messages.size).toBe(2)

      const messagesA = indieDelegate.messages.get(messageA.location.file)
      expect(Array.isArray(messagesA)).toBe(true)
      expect(messagesA).toEqual([messageA, messageB])

      const messagesB = indieDelegate.messages.get(messageC.location.file)
      expect(Array.isArray(messagesB)).toBe(true)
      expect(messagesB).toEqual([messageC, messageD])
    })
    it('does not update if disposed', function () {
      let timesUpdated = 0
      indieDelegate.onDidUpdate(function () {
        timesUpdated++
      })
      expect(timesUpdated).toBe(0)
      indieDelegate.setAllMessages([getMessage(false)])
      expect(timesUpdated).toBe(1)
      indieDelegate.dispose()
      indieDelegate.setAllMessages([])
      expect(timesUpdated).toBe(1)
    })
    it('does update if not disposed', function () {
      let timesUpdated = 0
      indieDelegate.onDidUpdate(function () {
        timesUpdated++
      })
      expect(timesUpdated).toBe(0)
      indieDelegate.setAllMessages([getMessage(false)])
      expect(timesUpdated).toBe(1)
      indieDelegate.setAllMessages([])
      expect(timesUpdated).toBe(2)
    })
    it('does not add invalid messages', function () {
      expect(indieDelegate.getMessages().length).toBe(0)
      expect(atom.notifications.getNotifications().length).toBe(0)
      indieDelegate.setAllMessages([{}])
      expect(indieDelegate.getMessages().length).toBe(0)
      expect(atom.notifications.getNotifications().length).toBe(1)
      indieDelegate.setAllMessages([getMessage(__filename)])
      expect(indieDelegate.getMessages().length).toBe(1)
      expect(atom.notifications.getNotifications().length).toBe(1)
    })
  })
  describe('::dispose', function () {
    it('clears messages', function () {
      indieDelegate.setAllMessages([getMessage(false)])
      expect(indieDelegate.messages.size).toBe(1)
      indieDelegate.dispose()
      expect(indieDelegate.messages.size).toBe(0)
    })
    it('emits did-destroy event', function () {
      let didDestroy = false
      indieDelegate.onDidDestroy(function () {
        didDestroy = true
      })
      expect(didDestroy).toBe(false)
      indieDelegate.dispose()
      expect(didDestroy).toBe(true)
    })
  })
  describe('::onDidUpdate', function () {
    it('includes all of the messages', function () {
      const messagesA = [getMessage('a'), getMessage('a'), getMessage('a'), getMessage('a'), getMessage('a')]
      const messagesB = [getMessage('b'), getMessage('b'), getMessage('b'), getMessage('b'), getMessage('b')]
      const spyCallback = jasmine.createSpy('onDidUpdate')
      indieDelegate.onDidUpdate(spyCallback)
      indieDelegate.setMessages('a', messagesA)
      indieDelegate.setMessages('b', messagesB)
      indieDelegate.clearMessages()
      expect(spyCallback.calls.length).toBe(3)
      expect(spyCallback.calls[0].args[0]).toEqual(messagesA)
      expect(spyCallback.calls[1].args[0]).toEqual(messagesA.concat(messagesB))
      expect(spyCallback.calls[2].args[0]).toEqual([])
    })
  })
})
