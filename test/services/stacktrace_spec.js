import fs from 'fs'
import {expect} from 'chai'

import {parse} from '../../src/services/stacktrace'

const VALID_STACK_SHORT = fs.readFileSync(__dirname + '/../fixtures/valid_stack1.txt').toString()
const VALID_STACK_LONG = fs.readFileSync(__dirname + '/../fixtures/valid_stack2.txt').toString()

describe('stacktracke service', function () {
  describe('#parse', function () {
    context('when used on short stack', function (){
      beforeEach(function () {
        this.results = parse(VALID_STACK_SHORT)
      })

      it('should parse short stack until it comes from user code', function () {
        expect(this.results).to.have.lengthOf(1)
      })

      it('should show "sum" call with altered line number', function () {
        expect(this.results[0]).to.have.contain('at sum (eval at <anonymous>:4:2)')
      })
    })

    context('when used on long stack', function () {
      beforeEach(function () {
        this.results = parse(VALID_STACK_LONG)
      })

      it('should parse long stack until it comes from user code', function () {
        const results = parse(VALID_STACK_LONG)

        expect(results).to.have.lengthOf(2)
      })

      it('should show "a" call with altered line number', function () {
        expect(this.results[0]).to.have.contain('at a (eval at <anonymous>:8:5)')
      })

      it('should show "show" call with altered line number', function () {
        expect(this.results[1]).to.have.contain('at sum (eval at <anonymous>:4:2)')
      })
    })
  })
})
